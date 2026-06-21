import type { DrinkLog, DrinkType, Gender, NotificationStyle } from "@prisma/client";

export const BAC_DISCLAIMER =
  "Do not drive after drinking. This is only an estimate and is not legal or medical advice.";

export function calculateAlcoholGrams(volumeMl: number, abv: number) {
  return volumeMl * (abv / 100) * 0.789;
}

export function estimateCalories(drinkType: DrinkType, volumeMl: number, abv: number) {
  const alcoholCalories = calculateAlcoholGrams(volumeMl, abv) * 7;
  const multiplier: Record<DrinkType, number> = {
    BEER: 1.25,
    WINE: 1.15,
    WHISKY: 1.05,
    VODKA: 1.05,
    GIN: 1.05,
    RUM: 1.15,
    TEQUILA: 1.05,
    COCKTAIL: 1.75,
    OTHER: 1.25,
  };

  return Math.round(alcoholCalories * multiplier[drinkType]);
}

export function estimateBAC(
  userWeightKg: number,
  gender: Gender | null | undefined,
  alcoholGrams: number,
  hoursSinceFirstDrink: number,
) {
  const distributionRatio = gender === "FEMALE" ? 0.55 : 0.68;
  const rawBac = (alcoholGrams / (userWeightKg * 1000 * distributionRatio)) * 100;
  const metabolized = Math.max(0, hoursSinceFirstDrink) * 0.015;

  return Math.max(0, Number((rawBac - metabolized).toFixed(3)));
}

export function getFunnySafetyStatus(bacEstimate: number) {
  if (bacEstimate === 0) return "Fresh Mode";
  if (bacEstimate <= 0.03) return "Light Vibes";
  if (bacEstimate <= 0.06) return "Uber Thinking Zone";
  if (bacEstimate <= 0.1) return "Do Not Drive Mode";
  return "Teleportation Recommended";
}

export function generateFunnyNotification(
  userName: string,
  drinkLog: Pick<DrinkLog, "drinkName" | "location">,
  notificationStyle: NotificationStyle,
) {
  if (notificationStyle === "SERIOUS") {
    return `${userName} logged ${articleFor(drinkLog.drinkName)} ${drinkLog.drinkName}.`;
  }

  const funny = [
    `${userName} started a side quest.`,
    `${userName} entered Weekend Mode.`,
    `${userName} logged ${articleFor(drinkLog.drinkName)} ${drinkLog.drinkName} and unlocked +10 confidence.`,
    `${userName} logged ${articleFor(drinkLog.drinkName)} ${drinkLog.drinkName}${drinkLog.location ? ` at ${drinkLog.location}` : ""}.`,
    `${userName} is now operating on vibes.`,
    `${userName} has entered the confidence expansion pack.`,
    `${userName} is networking aggressively.`,
    `${userName} found the plot again. Temporarily.`,
    `${userName} has activated dance-floor analytics.`,
    `${userName} just made the group chat louder.`,
    `${userName} is collecting memories like trading cards.`,
    `${userName} chose vibes as the operating system.`,
    `${userName} has begun advanced bar research.`,
    `${userName} is making tonight statistically interesting.`,
    `${userName} believes hydration is a future problem.`,
    `${userName} just filed a report with the Department of Vibes.`,
    `${userName} is now in soft-launch party mode.`,
    `${userName} added another data point to the evening.`,
    `${userName} is politely ignoring tomorrow.`,
    `${userName} is testing the limits of charisma.`,
    `${userName} has entered snack negotiation mode.`,
    `${userName} is building lore one sip at a time.`,
    `${userName} has upgraded from plans to plots.`,
    `${userName} is now sponsored by confidence.`,
    `${userName} has started talking with hand gestures.`,
    `${userName} is running on sparkle and poor timing.`,
    `${userName} logged evidence for future historians.`,
    `${userName} has opened a new chapter called "why not."`,
    `${userName} is performing fieldwork at ${drinkLog.location ?? "an undisclosed location"}.`,
    `${userName} has selected chaos, but tastefully.`,
  ];

  const chaos = [
    `${userName} unlocked questionable decision making.`,
    `${userName} believes one more drink is a good idea.`,
    `${userName} unlocked: Questionable Decisions.`,
    `${userName} converted money into memories with ${articleFor(drinkLog.drinkName)} ${drinkLog.drinkName}.`,
    `${userName} is now operating on vibes and questionable strategy.`,
    `${userName} has joined the council of bad ideas.`,
    `${userName} is one toast away from a side plot.`,
    `${userName} has entered "text nobody" mode. We hope.`,
    `${userName} is treating the bar tab like a subscription.`,
    `${userName} is doing cardio, but emotionally.`,
    `${userName} found a new personality setting.`,
    `${userName} has been promoted to Minister of Nonsense.`,
    `${userName} is making eye contact with destiny.`,
    `${userName} is giving tomorrow character development.`,
    `${userName} has unlocked premium confidence.`,
    `${userName} is currently accepting compliments and fries.`,
    `${userName} has reached group-photo velocity.`,
    `${userName} is no longer reading the terms and conditions.`,
    `${userName} has turned the evening into a documentary.`,
    `${userName} is in a committed relationship with the aux cord.`,
    `${userName} has begun negotiating with gravity.`,
    `${userName} is now 80% plans, 20% sparkle.`,
    `${userName} just gave the wallet a plot twist.`,
    `${userName} is legally distinct from a good idea.`,
    `${userName} is entering the kebab prophecy phase.`,
    `${userName} has found the confidence DLC.`,
    `${userName} is moving like the main character.`,
    `${userName} has achieved mild theatrical excellence.`,
    `${userName} just said "quick one" with dangerous confidence.`,
    `${userName} is building a case for breakfast tomorrow.`,
  ];

  const pool = notificationStyle === "CHAOS" ? chaos : funny;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function articleFor(word: string) {
  return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
}
