import { DrinkType, DrinkingGoal, Gender, NotificationStyle, Visibility } from "@prisma/client";

export function titleEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const drinkTypes = Object.values(DrinkType);
export const genders = Object.values(Gender);
export const drinkingGoals = Object.values(DrinkingGoal);
export const notificationStyles = Object.values(NotificationStyle);
export const visibilities = Object.values(Visibility);

export function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
