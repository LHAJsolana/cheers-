import { NextRequest } from "next/server";
import { apiError, json, publicUser, requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema, profileSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const user = await requireApiUser(request);
  if (!user) return apiError("Unauthorized", 401);
  return json({ user: publicUser(user) });
}

export async function PATCH(request: NextRequest) {
  const user = await requireApiUser(request);
  if (!user) return apiError("Unauthorized", 401);

  const body = await request.json();
  if (body.onboardingCompleted === true) {
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? "Invalid profile.");

    const data = parsed.data;
    const usernameTaken = await prisma.user.findFirst({ where: { username: data.username, NOT: { id: user.id } } });
    if (usernameTaken) return apiError("Username is already taken.", 409);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: data.username,
        weightKg: data.weightKg,
        drinkingGoal: data.drinkingGoal,
        notificationStyle: data.notificationStyle,
        onboardingCompleted: true,
        ageConfirmedAt: new Date(),
      },
    });

    return json({ user: publicUser(updated) });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? "Invalid profile.");
  const data = parsed.data;
  const usernameTaken = await prisma.user.findFirst({ where: { username: data.username, NOT: { id: user.id } } });
  if (usernameTaken) return apiError("Username is already taken.", 409);

  const updated = await prisma.user.update({
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

  return json({ user: publicUser(updated) });
}
