import { createAuthToken, verifyPassword } from "@/lib/auth";
import { apiError, json, publicUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { authRateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return apiError("Invalid email or password.", 401);
  const limited = rateLimitAuth(request, "login", parsed.data.email);
  if (limited) return limited;

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return apiError("Invalid email or password.", 401);
  }

  return json({ token: createAuthToken(user.id), user: publicUser(user) });
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
