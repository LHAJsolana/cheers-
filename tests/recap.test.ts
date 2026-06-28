import assert from "node:assert/strict";
import test from "node:test";
import { alcoholFreeDaysThisWeek, currentSoberStreak, mostCommon } from "../src/lib/analytics";
import { weeklyRecap } from "../src/lib/recap";

test("counts common values and builds weekly recap totals", () => {
  const now = new Date();
  const logs = [
    { drinkName: "Lager", location: "Sky Bar", price: 8, caloriesEstimate: 160, loggedAt: now },
    { drinkName: "Lager", location: "Sky Bar", price: 9, caloriesEstimate: 170, loggedAt: now },
    { drinkName: "Spritz", location: "Garden", price: 12, caloriesEstimate: 220, loggedAt: now },
  ];

  assert.equal(mostCommon(logs.map((log) => log.drinkName)), "Lager");
  assert.deepEqual(weeklyRecap(logs), {
    drinks: 3,
    spent: 29,
    calories: 550,
    favoriteDrink: "Lager",
    favoriteLocation: "Sky Bar",
    summary: "Mostly powered by Lagers.",
  });
});

test("tracks sober streak and week free-day summary", () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const logs = [{ loggedAt: yesterday }];

  assert.equal(currentSoberStreak(logs), 1);
  const freeDays = alcoholFreeDaysThisWeek(logs);
  assert.ok(freeDays.totalDays >= 1);
  assert.ok(freeDays.freeDays >= 0);
});
