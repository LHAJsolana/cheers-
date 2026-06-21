import type { DrinkLog } from "@prisma/client";
import { mostCommon, startOfWeek } from "@/lib/analytics";

export function weeklyRecap(logs: Pick<DrinkLog, "drinkName" | "location" | "price" | "caloriesEstimate" | "loggedAt">[]) {
  const weekLogs = logs.filter((log) => log.loggedAt >= startOfWeek());
  const favoriteDrink = mostCommon(weekLogs.map((log) => log.drinkName));
  const favoriteLocation = mostCommon(weekLogs.map((log) => log.location).filter(Boolean) as string[]);
  const spent = weekLogs.reduce((sum, log) => sum + log.price, 0);
  const calories = weekLogs.reduce((sum, log) => sum + log.caloriesEstimate, 0);

  return {
    drinks: weekLogs.length,
    spent,
    calories,
    favoriteDrink,
    favoriteLocation,
    summary: recapSummary({ favoriteDrink, favoriteLocation, spent, drinks: weekLogs.length }),
  };
}

function recapSummary({
  favoriteDrink,
  favoriteLocation,
  spent,
  drinks,
}: {
  favoriteDrink: string | null;
  favoriteLocation: string | null;
  spent: number;
  drinks: number;
}) {
  if (drinks === 0) return "Quiet week. Your wallet is suspiciously calm.";
  if (spent > 100) return "Your wallet has concerns.";
  if (favoriteDrink) return `Mostly powered by ${favoriteDrink}s.`;
  if (favoriteLocation) return `Congratulations. You visited ${favoriteLocation} again.`;
  return "You survived another weekend.";
}
