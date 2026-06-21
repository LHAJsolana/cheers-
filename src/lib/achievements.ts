import { AchievementCode, ActivityType, DrinkType, type User } from "@prisma/client";
import { currentSoberStreak } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

const achievements: Record<AchievementCode, { emoji: string; title: string; description: string }> = {
  FIRST_ROUND: { emoji: "🍺", title: "First Round", description: "Log first drink" },
  COCKTAIL_EXPLORER: { emoji: "🍹", title: "Cocktail Explorer", description: "Try 10 cocktails" },
  WINE_ENJOYER: { emoji: "🍷", title: "Wine Enjoyer", description: "Log 20 wines" },
  FINANCIAL_MISTAKE: { emoji: "💸", title: "Financial Mistake", description: "Spend over $100" },
  BAR_HOPPER: { emoji: "🗺️", title: "Bar Hopper", description: "Visit 10 locations" },
  RESPONSIBLE_HUMAN: { emoji: "😇", title: "Responsible Human", description: "7 alcohol-free days" },
};

export function achievementMeta(code: AchievementCode) {
  return achievements[code];
}

export async function checkAchievements(user: User) {
  const logs = await prisma.drinkLog.findMany({ where: { userId: user.id } });
  const checkIns = await prisma.checkIn.findMany({ where: { userId: user.id } });
  const unlocked = await prisma.userAchievement.findMany({ where: { userId: user.id } });
  const already = new Set(unlocked.map((item) => item.code));
  const toUnlock: AchievementCode[] = [];

  if (logs.length >= 1) toUnlock.push(AchievementCode.FIRST_ROUND);
  if (logs.filter((log) => log.drinkType === DrinkType.COCKTAIL).length >= 10) toUnlock.push(AchievementCode.COCKTAIL_EXPLORER);
  if (logs.filter((log) => log.drinkType === DrinkType.WINE).length >= 20) toUnlock.push(AchievementCode.WINE_ENJOYER);
  if (logs.reduce((sum, log) => sum + log.price, 0) >= 100) toUnlock.push(AchievementCode.FINANCIAL_MISTAKE);
  if (new Set(checkIns.map((checkIn) => checkIn.location.toLowerCase())).size >= 10) toUnlock.push(AchievementCode.BAR_HOPPER);
  if (currentSoberStreak(logs) >= 7) toUnlock.push(AchievementCode.RESPONSIBLE_HUMAN);

  for (const code of toUnlock.filter((code) => !already.has(code))) {
    const meta = achievements[code];
    await prisma.userAchievement.create({
      data: { userId: user.id, code, title: `${meta.emoji} ${meta.title}` },
    });
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: ActivityType.ACHIEVEMENT_UNLOCKED,
        message: `${user.name} unlocked ${meta.title}.`,
      },
    });
  }
}
