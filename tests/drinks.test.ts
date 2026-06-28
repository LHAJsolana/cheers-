import assert from "node:assert/strict";
import test from "node:test";
import { DrinkType } from "@prisma/client";
import { calculateAlcoholGrams, estimateBAC, estimateCalories, getFunnySafetyStatus } from "../src/lib/drinks";

test("calculates alcohol grams from volume and ABV", () => {
  assert.equal(Number(calculateAlcoholGrams(500, 5).toFixed(3)), 19.725);
});

test("estimates calories from alcohol and drink multiplier", () => {
  assert.equal(estimateCalories(DrinkType.BEER, 500, 5), 214);
  assert.equal(estimateCalories(DrinkType.WINE, 150, 13), 124);
  assert.equal(estimateCalories(DrinkType.VODKA, 250, 8), 116);
  assert.equal(estimateCalories(DrinkType.COCKTAIL, 220, 12), 255);
  assert.equal(estimateCalories(DrinkType.WHISKY, 50, 40), 116);
  assert.equal(estimateCalories(DrinkType.TEQUILA, 45, 40), 104);
});

test("estimates BAC with metabolism over time", () => {
  const bac = estimateBAC(75, "MALE", 40, 2);
  assert.equal(bac, 0.048);
  assert.equal(getFunnySafetyStatus(bac), "Uber Thinking Zone");
});
