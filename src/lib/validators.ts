import { DrinkType, DrinkingGoal, Gender, NotificationStyle, Visibility } from "@prisma/client";
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const drinkLogSchema = z.object({
  drinkType: z.nativeEnum(DrinkType),
  drinkName: z.string().trim().min(1, "Drink name is required"),
  volumeMl: z.coerce.number().positive().max(3000),
  abv: z.coerce.number().min(0).max(95),
  price: z.coerce.number().min(0).max(100000),
  location: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(240).optional(),
  drinkPhotoUrl: z.string().max(800000).optional(),
  placePhotoUrl: z.string().max(800000).optional(),
  loggedAt: z.string().min(1),
  visibility: z.nativeEnum(Visibility),
  checkIn: z
    .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal(""), z.null()])
    .optional()
    .transform((value) => value === true || value === "on" || value === "true"),
});

export const friendSchema = z.object({
  username: z.string().trim().min(3),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2),
  username: z.string().trim().min(3).regex(/^[a-zA-Z0-9_]+$/),
  weightKg: z.coerce.number().min(30).max(250),
  gender: z.union([z.nativeEnum(Gender), z.literal("")]).optional(),
  drinkingGoal: z.nativeEnum(DrinkingGoal),
  notificationStyle: z.nativeEnum(NotificationStyle),
  privacyDefault: z.nativeEnum(Visibility),
});

export const onboardingSchema = z.object({
  username: z.string().trim().min(3).regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscores"),
  weightKg: z.coerce.number().min(30).max(250),
  notificationStyle: z.nativeEnum(NotificationStyle),
  drinkingGoal: z.nativeEnum(DrinkingGoal),
  ageConfirmed: z
    .union([z.boolean(), z.literal("on"), z.literal("true")])
    .transform((value) => value === true || value === "on" || value === "true")
    .refine(Boolean, "Tap the 18+ badge to enter."),
});
