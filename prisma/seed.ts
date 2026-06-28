import {
  AchievementCode,
  ActivityType,
  DrinkType,
  FriendshipStatus,
  NotificationStyle,
  PrismaClient,
  ReactionType,
  Visibility,
  type Session,
  type User,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateAlcoholGrams, estimateCalories, generateFunnyNotification } from "../src/lib/drinks";

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.drinkLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);
  const taha = await createUser("Taha", "taha@cheers.local", "taha", passwordHash, 76, NotificationStyle.CHAOS);
  const maya = await createUser("Maya", "maya@cheers.local", "maya", passwordHash, 63, NotificationStyle.FUNNY);
  const sam = await createUser("Sam", "sam@cheers.local", "sam", passwordHash, 82, NotificationStyle.FUNNY);

  await prisma.friendship.createMany({
    data: [
      { requesterId: taha.id, receiverId: maya.id, status: FriendshipStatus.ACCEPTED },
      { requesterId: taha.id, receiverId: sam.id, status: FriendshipStatus.ACCEPTED },
    ],
  });

  const saturday = await createSession(taha, "Saturday Chaos 🍹", hoursAgo(2), null, "Sky Bar");
  const friday = await createSession(taha, "Friday Night 🍻", daysAgo(1), hoursAgo(18), "Tap Room");
  const mayaNight = await createSession(maya, "Soft Launch Spritz ✨", hoursAgo(4), null, "Little Bistro");

  const activities = [];
  activities.push(await createDrink(taha, saturday, DrinkType.COCKTAIL, "Mojito", 220, 12, 33, "Sky Bar", hoursAgo(2)));
  activities.push(await createDrink(taha, saturday, DrinkType.TEQUILA, "Paloma", 200, 10, 28, "Sky Bar", hoursAgo(1)));
  activities.push(await createDrink(taha, friday, DrinkType.BEER, "Pale Ale", 330, 5.2, 18, "Tap Room", daysAgo(1)));
  activities.push(await createDrink(taha, friday, DrinkType.COCKTAIL, "Negroni", 120, 24, 29, "Tap Room", daysAgo(1, -1)));
  activities.push(await createDrink(maya, mayaNight, DrinkType.WINE, "House Red", 150, 13, 9, "Little Bistro", hoursAgo(4)));
  activities.push(await createDrink(maya, mayaNight, DrinkType.COCKTAIL, "Aperol Spritz", 180, 11, 11, "Little Bistro", hoursAgo(3)));
  activities.push(await createDrink(sam, null, DrinkType.BEER, "Lager", 330, 5, 6, "Corner Pub", hoursAgo(6)));

  await prisma.activity.createMany({
    data: [
      {
        userId: taha.id,
        sessionId: friday.id,
        type: ActivityType.SESSION_COMPLETED,
        message: "Taha completed Friday Night 🍻. 2 drinks · 420 calories · $47 spent.",
        createdAt: hoursAgo(18),
      },
      {
        userId: maya.id,
        type: ActivityType.CHECK_IN,
        message: "Maya checked in at Little Bistro.",
        createdAt: hoursAgo(4),
      },
      {
        userId: sam.id,
        type: ActivityType.CHECK_IN,
        message: "Sam checked in at Corner Pub.",
        createdAt: hoursAgo(6),
      },
    ],
  });

  await prisma.userAchievement.createMany({
    data: [
      { userId: taha.id, code: AchievementCode.FIRST_ROUND, title: "🍺 First Round", createdAt: daysAgo(1) },
      { userId: taha.id, code: AchievementCode.FINANCIAL_MISTAKE, title: "💸 Financial Mistake", createdAt: hoursAgo(1) },
      { userId: maya.id, code: AchievementCode.FIRST_ROUND, title: "🍺 First Round", createdAt: hoursAgo(3) },
    ],
  });

  await prisma.activity.createMany({
    data: [
      { userId: taha.id, type: ActivityType.ACHIEVEMENT_UNLOCKED, message: "Taha unlocked Financial Mistake.", createdAt: hoursAgo(1) },
      { userId: maya.id, type: ActivityType.ACHIEVEMENT_UNLOCKED, message: "Maya unlocked First Round.", createdAt: hoursAgo(3) },
    ],
  });

  await prisma.reaction.createMany({
    data: [
      { userId: maya.id, activityId: activities[0].id, type: ReactionType.CHEERS },
      { userId: sam.id, activityId: activities[0].id, type: ReactionType.CHAOS },
      { userId: taha.id, activityId: activities[4].id, type: ReactionType.LEGENDARY },
      { userId: sam.id, activityId: activities[4].id, type: ReactionType.RESPECT },
      { userId: maya.id, activityId: activities[6].id, type: ReactionType.RIP_TOMORROW },
    ],
  });
}

async function createUser(name: string, email: string, username: string, passwordHash: string, weightKg: number, notificationStyle: NotificationStyle) {
  return prisma.user.create({
    data: {
      name,
      email,
      username,
      passwordHash,
      weightKg,
      notificationStyle,
      onboardingCompleted: true,
      ageConfirmedAt: new Date(),
    },
  });
}

async function createSession(user: User, title: string, startTime: Date, endTime: Date | null, location: string) {
  return prisma.session.create({
    data: { userId: user.id, title, startTime, endTime, location },
  });
}

async function createDrink(
  user: User,
  session: Session | null,
  drinkType: DrinkType,
  drinkName: string,
  volumeMl: number,
  abv: number,
  price: number,
  location: string,
  loggedAt: Date,
) {
  const alcoholGramsEstimate = calculateAlcoholGrams(volumeMl, abv);
  const caloriesEstimate = estimateCalories(drinkType, volumeMl, abv);
  const drinkLog = await prisma.drinkLog.create({
    data: {
      userId: user.id,
      sessionId: session?.id,
      drinkType,
      drinkName,
      volumeMl,
      abv,
      price,
      location,
      loggedAt,
      visibility: Visibility.FRIENDS,
      caloriesEstimate,
      alcoholGramsEstimate,
    },
  });

  if (session) {
    await prisma.session.update({
      where: { id: session.id },
      data: {
        totalDrinks: { increment: 1 },
        totalCalories: { increment: caloriesEstimate },
        totalSpent: { increment: price },
      },
    });
  }

  await prisma.checkIn.create({ data: { userId: user.id, location, createdAt: loggedAt } });

  return prisma.activity.create({
    data: {
      userId: user.id,
      drinkLogId: drinkLog.id,
      sessionId: session?.id,
      type: ActivityType.DRINK_LOGGED,
      message: generateFunnyNotification(user.name, drinkLog, user.notificationStyle),
      createdAt: loggedAt,
    },
  });
}

function daysAgo(days: number, hoursForward = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() + hoursForward);
  return date;
}

function hoursAgo(hours: number) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
