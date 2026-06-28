import { ActivityType } from "@prisma/client";
import { createAuthToken, hashPassword } from "@/lib/auth";
import { apiError, json, publicUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { authRateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json());
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? "Invalid signup details.");
  const limited = rateLimitAuth(request, "signup", parsed.data.email);
  if (limited) return limited;

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return apiError("Email is already taken.", 409);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      username: await uniqueUsername(name, email),
      passwordHash: await hashPassword(password),
      activities: { create: { type: ActivityType.BADGE_UNLOCKED, message: `${name} joined Cheers and chose memory over mystery.` } },
    },
  });

  return json({ token: createAuthToken(user.id), user: publicUser(user) }, 201);
}

function rateLimitAuth(request: Request, scope: "login" | "signup", identifier: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");
  const result = checkRateLimit(authRateLimitKey(ip, scope, identifier), {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (result.allowed) return null;
  return apiError(`Too many attempts. Try again in ${result.retryAfterSeconds} seconds.`, 429);
}

async function uniqueUsername(name: string, email: string) {
  const base = (name || email.split("@")[0]).toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 16) || "cheers";
  let candidate = base;
  let index = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${index}`;
    index += 1;
  }
  return candidate;
}
