"use server";

import { ActivityType, type ReactionType } from "@prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword, requireUser, setSession, verifyPassword, clearSession } from "@/lib/auth";
import { isPresetComment } from "@/lib/comment-presets";
import {
  calculateAlcoholGrams,
  estimateCalories,
  generateFunnyNotification,
} from "@/lib/drinks";
import { checkAchievements } from "@/lib/achievements";
import { drinkActivityRecords } from "@/lib/drink-activity";
import { addFriendByUsername, respondToFriendRequest } from "@/lib/friends";
import { prisma } from "@/lib/prisma";
import { authRateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import { addDrinkToSession, closeExpiredSessions, getOrCreateSession } from "@/lib/sessions";
import { drinkLogSchema, friendSchema, loginSchema, onboardingSchema, profileSchema, signupSchema } from "@/lib/validators";

export type ActionState = {
  ok?: boolean;
  error?: string;
};

export async function signupAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid sign up details" };
  const limited = await authAttemptError("signup", parsed.data.email);
  if (limited) return limited;

  const { name, email, password } = parsed.data;
  const username = await uniqueUsername(name, email);
  const existing = await prisma.user.findFirst({
    where: { email },
  });
  if (existing) return { error: "Email is already taken." };

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      passwordHash: await hashPassword(password),
      activities: {
        create: {
          type: ActivityType.BADGE_UNLOCKED,
          message: `${name} joined Cheers and chose memory over mystery.`,
        },
      },
    },
  });

  await setSession(user.id);
  redirect("/onboarding");
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid email or password." };
  const limited = await authAttemptError("login", parsed.data.email);
  if (limited) return limited;

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await setSession(user.id);
  redirect(user.onboardingCompleted ? "/dashboard" : "/onboarding");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function logDrinkAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = drinkLogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Could not log drink." };

  const data = parsed.data;
  const alcoholGramsEstimate = calculateAlcoholGrams(data.volumeMl, data.abv);
  const caloriesEstimate = estimateCalories(data.drinkType, data.volumeMl, data.abv);

  const loggedAt = new Date(data.loggedAt);
  const session = await getOrCreateSession(user, {
    loggedAt,
    location: data.location || null,
  });
  const drinkLog = await prisma.drinkLog.create({
    data: {
      userId: user.id,
      drinkType: data.drinkType,
      drinkName: data.drinkName,
      volumeMl: data.volumeMl,
      abv: data.abv,
      price: data.price,
      location: data.location || null,
      notes: data.notes || null,
      drinkPhotoUrl: await fileToDataUrl(formData.get("drinkPhoto")),
      placePhotoUrl: await fileToDataUrl(formData.get("placePhoto")),
      loggedAt,
      visibility: data.visibility,
      caloriesEstimate,
      alcoholGramsEstimate,
      sessionId: session.id,
    },
  });
  await addDrinkToSession(session, drinkLog);

  const message = generateFunnyNotification(user.name, drinkLog, user.notificationStyle);
  const sessionDrinkCount = await prisma.drinkLog.count({ where: { sessionId: session.id } });

  await prisma.activity.createMany({
    data: drinkActivityRecords({
      user,
      drinkLog,
      session,
      message,
      isFirstSessionDrink: sessionDrinkCount === 1,
      checkIn: data.checkIn,
    }),
  });

  if (data.checkIn && data.location) {
    await prisma.checkIn.create({
      data: { userId: user.id, location: data.location },
    });
  }

  await checkAchievements(user);
  revalidatePath("/dashboard");
  revalidatePath("/activity");
  revalidatePath("/stats");
  redirect("/dashboard");
}

export async function reactToActivityAction(activityId: string, type: ReactionType) {
  const user = await requireUser();
  const existing = await prisma.reaction.findUnique({
    where: { userId_activityId_type: { userId: user.id, activityId, type } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { userId: user.id, activityId, type } });
  }

  revalidatePath("/activity");
}

export async function addPresetCommentAction(activityId: string, text: string) {
  const user = await requireUser();
  if (!isPresetComment(text)) return;

  await prisma.comment.create({
    data: {
      userId: user.id,
      activityId,
      text,
    },
  });

  revalidatePath("/activity");
}

export async function addFriendAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = friendSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid username." };

  try {
    await addFriendByUsername(user, parsed.data.username);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not add friend." };
  }

  revalidatePath("/friends");
  revalidatePath("/activity");
  return { ok: true };
}

export async function respondToFriendRequestAction(friendshipId: string, action: "accept" | "reject") {
  const user = await requireUser();
  await respondToFriendRequest(user, friendshipId, action);
  revalidatePath("/friends");
  revalidatePath("/activity");
}

export async function updateProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Could not update profile." };

  const data = parsed.data;
  const usernameTaken = await prisma.user.findFirst({
    where: { username: data.username, NOT: { id: user.id } },
  });
  if (usernameTaken) return { error: "Username is already taken." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      username: data.username,
      weightKg: data.weightKg,
      gender: data.gender || null,
      drinkingGoal: data.drinkingGoal,
      notificationStyle: data.notificationStyle,
      privacyDefault: data.privacyDefault,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function completeOnboardingAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Could not finish onboarding." };

  const usernameTaken = await prisma.user.findFirst({
    where: { username: parsed.data.username, NOT: { id: user.id } },
  });
  if (usernameTaken) return { error: "Username is already taken." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      username: parsed.data.username,
      weightKg: parsed.data.weightKg,
      notificationStyle: parsed.data.notificationStyle,
      drinkingGoal: parsed.data.drinkingGoal,
      onboardingCompleted: true,
      ageConfirmedAt: new Date(),
    },
  });

  redirect("/dashboard");
}

export async function closeSessionsAction() {
  const user = await requireUser();
  await closeExpiredSessions(user.id);
  await checkAchievements(user);
  revalidatePath("/dashboard");
  revalidatePath("/activity");
  revalidatePath("/stats");
}

async function uniqueUsername(name: string, email: string) {
  const base = (name || email.split("@")[0])
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 16) || "cheers";
  let candidate = base;
  let index = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${index}`;
    index += 1;
  }
  return candidate;
}

async function authAttemptError(scope: "login" | "signup", identifier: string): Promise<ActionState | null> {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip");
  const result = checkRateLimit(authRateLimitKey(ip, scope, identifier), {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });

  if (result.allowed) return null;
  return { error: `Too many attempts. Try again in ${result.retryAfterSeconds} seconds.` };
}

async function fileToDataUrl(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return null;
  if (!value.type.startsWith("image/")) throw new Error("Use an image file.");
  if (value.size > 750_000) throw new Error("Keep photos under 750 KB for now.");

  const bytes = Buffer.from(await value.arrayBuffer());
  return `data:${value.type};base64,${bytes.toString("base64")}`;
}
