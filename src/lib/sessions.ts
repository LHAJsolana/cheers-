import { ActivityType, type DrinkLog, type Session, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const SESSION_GAP_HOURS = 3;

export async function closeExpiredSessions(userId?: string) {
  const openSessions = await prisma.session.findMany({
    where: { endTime: null, ...(userId ? { userId } : {}) },
    include: { drinkLogs: { orderBy: { loggedAt: "desc" } }, user: true },
  });

  const now = Date.now();
  for (const session of openSessions) {
    const lastDrink = session.drinkLogs[0];
    if (!lastDrink) continue;

    const expiresAt = lastDrink.loggedAt.getTime() + SESSION_GAP_HOURS * 60 * 60 * 1000;
    if (now < expiresAt) continue;

    const endTime = new Date(expiresAt);
    await prisma.session.update({
      where: { id: session.id },
      data: { endTime },
    });
    await prisma.activity.create({
      data: {
        userId: session.userId,
        sessionId: session.id,
        type: ActivityType.SESSION_COMPLETED,
        message: `${session.user.name} completed ${session.title}. ${session.totalDrinks} drinks · ${Math.round(session.totalCalories)} calories · $${session.totalSpent.toFixed(0)} spent.`,
        createdAt: endTime,
      },
    });
  }
}

export async function getOrCreateSession(user: User, drink: Pick<DrinkLog, "loggedAt" | "location">) {
  await closeExpiredSessions(user.id);

  const openSession = await prisma.session.findFirst({
    where: { userId: user.id, endTime: null },
    orderBy: { startTime: "desc" },
  });

  if (openSession) return openSession;

  return prisma.session.create({
    data: {
      userId: user.id,
      title: sessionTitle(drink.loggedAt),
      startTime: drink.loggedAt,
      location: drink.location,
    },
  });
}

export async function addDrinkToSession(session: Session, drink: Pick<DrinkLog, "id" | "price" | "caloriesEstimate" | "location">) {
  await prisma.drinkLog.update({
    where: { id: drink.id },
    data: { sessionId: session.id },
  });

  await prisma.session.update({
    where: { id: session.id },
    data: {
      totalDrinks: { increment: 1 },
      totalCalories: { increment: drink.caloriesEstimate },
      totalSpent: { increment: drink.price },
      location: session.location ?? drink.location,
    },
  });
}

function sessionTitle(date: Date) {
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  if (day === "Friday") return "Friday Night 🍻";
  if (day === "Saturday") return "Saturday Chaos 🍹";
  if (day === "Sunday") return "Sunday Recovery 😅";
  return `${day} Vibes 🍸`;
}
