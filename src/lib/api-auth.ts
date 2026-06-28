import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

export function apiError(message: string, status = 400) {
  return json({ error: message }, status);
}

export async function requireApiUser(request: NextRequest) {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const userId = verifyAuthToken(token);
  if (!userId) return null;

  return prisma.user.findUnique({ where: { id: userId } });
}

export function publicUser(user: {
  id: string;
  name: string;
  email: string;
  username: string;
  weightKg: number;
  gender: string | null;
  drinkingGoal: string;
  notificationStyle: string;
    privacyDefault: string;
    onboardingCompleted: boolean;
    ageConfirmedAt?: Date | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    weightKg: user.weightKg,
    gender: user.gender,
    drinkingGoal: user.drinkingGoal,
    notificationStyle: user.notificationStyle,
    privacyDefault: user.privacyDefault,
    onboardingCompleted: user.onboardingCompleted,
    ageConfirmedAt: user.ageConfirmedAt ?? null,
  };
}
