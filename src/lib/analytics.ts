import type { DrinkLog } from "@prisma/client";

export function startOfWeek(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(copy.getFullYear(), copy.getMonth(), diff);
}

export function currentSoberStreak(logs: Pick<DrinkLog, "loggedAt">[]) {
  const drinkDays = new Set(logs.map((log) => dayKey(log.loggedAt)));
  let streak = 0;
  const cursor = new Date();

  while (!drinkDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
    if (streak > 3650) break;
  }

  return streak;
}

export function alcoholFreeDaysThisWeek(logs: Pick<DrinkLog, "loggedAt">[]) {
  const weekStart = startOfWeek();
  const drinkingDays = new Set(
    logs.filter((log) => log.loggedAt >= weekStart).map((log) => dayKey(log.loggedAt)),
  );
  const today = new Date();
  let totalDays = 0;
  let freeDays = 0;
  const cursor = new Date(weekStart);

  while (cursor <= today) {
    totalDays += 1;
    if (!drinkingDays.has(dayKey(cursor))) freeDays += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  return { freeDays, totalDays };
}

export function mostCommon<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
