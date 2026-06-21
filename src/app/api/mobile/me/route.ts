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
  const schema = body.onboardingCompleted === true ? onboardingSchema : profileSchema;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? "Invalid profile.");

  const data = parsed.data;
  const usernameTaken = await prisma.user.findFirst({ where: { username: data.username, NOT: { id: user.id } } });
  if (usernameTaken) return apiError("Username is already taken.", 409);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...data,
      gender: "gender" in data ? data.gender || null : user.gender,
      onboardingCompleted: body.onboardingCompleted === true ? true : user.onboardingCompleted,
    },
  });

  return json({ user: publicUser(updated) });
}
