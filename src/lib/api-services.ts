import { type ReactionType, type User } from "@prisma/client";
import { calculateAlcoholGrams, estimateBAC, estimateCalories, generateFunnyNotification, getFunnySafetyStatus } from "@/lib/drinks";
import { alcoholFreeDaysThisWeek, currentSoberStreak, mostCommon, startOfWeek } from "@/lib/analytics";
import { checkAchievements } from "@/lib/achievements";
import { drinkActivityRecords } from "@/lib/drink-activity";
import { getAcceptedFriendIds, visibleActivityWhere } from "@/lib/friends";
import { prisma } from "@/lib/prisma";
import { weeklyRecap } from "@/lib/recap";
import { addDrinkToSession, closeExpiredSessions, getOrCreateSession } from "@/lib/sessions";
import { drinkLogSchema } from "@/lib/validators";

export async function getDashboardPayload(user: User) {
  await closeExpiredSessions(user.id);
  const weekStart = startOfWeek();
  const logs = await prisma.drinkLog.findMany({ where: { userId: user.id }, orderBy: { loggedAt: "desc" } });
  const weekLogs = logs.filter((log) => log.loggedAt >= weekStart);
  const openSession = await prisma.session.findFirst({ where: { userId: user.id, endTime: null }, orderBy: { startTime: "desc" } });
  const recentSession = logs.filter((log) => Date.now() - log.loggedAt.getTime() < 8 * 60 * 60 * 1000);
  const sessionGrams = recentSession.reduce((sum, log) => sum + log.alcoholGramsEstimate, 0);
  const firstDrink = recentSession.at(-1)?.loggedAt;
  const hoursSinceFirstDrink = firstDrink ? (Date.now() - firstDrink.getTime()) / 36e5 : 0;
  const bac = estimateBAC(user.weightKg, user.gender, sessionGrams, hoursSinceFirstDrink);
  const sober = alcoholFreeDaysThisWeek(logs);

  return {
    stats: {
      drinksThisWeek: weekLogs.length,
      caloriesThisWeek: Math.round(weekLogs.reduce((sum, log) => sum + log.caloriesEstimate, 0)),
      spentThisWeek: weekLogs.reduce((sum, log) => sum + log.price, 0),
      soberStreak: currentSoberStreak(logs),
      alcoholFreeDays: sober,
    },
    safety: {
      bac,
      status: getFunnySafetyStatus(bac),
      tip: safetyTip(),
      urgent: bac >= 0.06,
      disclaimer: "Do not drive after drinking. This is only an estimate and is not legal or medical advice.",
    },
    recap: weeklyRecap(logs),
    openSession,
    lastDrink: logs[0] ?? null,
  };
}

export async function createDrinkFromApi(user: User, input: unknown) {
  const parsed = drinkLogSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Could not log drink.");
  }

  const data = parsed.data;
  const alcoholGramsEstimate = calculateAlcoholGrams(data.volumeMl, data.abv);
  const caloriesEstimate = estimateCalories(data.drinkType, data.volumeMl, data.abv);
  const loggedAt = new Date(data.loggedAt);
  const session = await getOrCreateSession(user, { loggedAt, location: data.location || null });

  const drinkLog = await prisma.drinkLog.create({
    data: {
      userId: user.id,
      drinkType: data.drinkType,
      drinkName: data.drinkName,
      volumeMl: data.volumeMl,
      abv: data.abv,
      price: data.price,
      location: data.location || null,
      notes: data.notes || null,
      drinkPhotoUrl: data.drinkPhotoUrl || null,
      placePhotoUrl: data.placePhotoUrl || null,
      loggedAt,
      visibility: data.visibility,
      caloriesEstimate,
      alcoholGramsEstimate,
      sessionId: session.id,
    },
  });
  await addDrinkToSession(session, drinkLog);

  const message = generateFunnyNotification(user.name, drinkLog, user.notificationStyle);
  const sessionDrinkCount = await prisma.drinkLog.count({ where: { sessionId: session.id } });
  await prisma.activity.createMany({
    data: drinkActivityRecords({
      user,
      drinkLog,
      session,
      message,
      isFirstSessionDrink: sessionDrinkCount === 1,
      checkIn: data.checkIn,
    }),
  });

  if (data.checkIn && data.location) {
    await prisma.checkIn.create({ data: { userId: user.id, location: data.location } });
  }
  await checkAchievements(user);
  return drinkLog;
}

export async function getFeedPayload(user: User) {
  await closeExpiredSessions(user.id);
  const acceptedFriendIds = await getAcceptedFriendIds(user.id);
  return prisma.activity.findMany({
    where: visibleActivityWhere(user.id, acceptedFriendIds),
    include: { user: true, drinkLog: true, reactions: true, comments: { include: { user: true }, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function toggleReaction(user: User, activityId: string, type: ReactionType) {
  const existing = await prisma.reaction.findUnique({ where: { userId_activityId_type: { userId: user.id, activityId, type } } });
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return { active: false };
  }
  await prisma.reaction.create({ data: { userId: user.id, activityId, type } });
  return { active: true };
}

export async function getStatsPayload(user: User) {
  await closeExpiredSessions(user.id);
  const logs = await prisma.drinkLog.findMany({ where: { userId: user.id }, orderBy: { loggedAt: "desc" } });
  const checkIns = await prisma.checkIn.findMany({ where: { userId: user.id } });
  const unlocked = await prisma.userAchievement.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const weekLogs = logs.filter((log) => log.loggedAt >= startOfWeek());
  const alcoholFree = alcoholFreeDaysThisWeek(logs);

  return {
    weeklyDrinks: weekLogs.length,
    weeklyCalories: Math.round(weekLogs.reduce((sum, log) => sum + log.caloriesEstimate, 0)),
    weeklySpending: weekLogs.reduce((sum, log) => sum + log.price, 0),
    alcoholFreeDays: alcoholFree,
    mostDrinkType: mostCommon(logs.map((log) => log.drinkType)),
    mostVisitedLocation: mostCommon(checkIns.map((checkIn) => checkIn.location)) ?? mostCommon(logs.map((log) => log.location).filter(Boolean) as string[]),
    achievements: unlocked,
    weeklyChart: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => ({
      day,
      count: weekLogs.filter((log) => ((log.loggedAt.getDay() + 6) % 7) === index).length,
    })),
  };
}

function safetyTip() {
  const tips = ["Water is your sidekick.", "Food before drinks is elite strategy.", "Uber is cheaper than bad decisions.", "A sober friend is the real MVP."];
  return tips[new Date().getDay() % tips.length];
}
