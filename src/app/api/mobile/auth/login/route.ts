import { createAuthToken, verifyPassword } from "@/lib/auth";
import { apiError, json, publicUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return apiError("Invalid email or password.", 401);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return apiError("Invalid email or password.", 401);
  }

  return json({ token: createAuthToken(user.id), user: publicUser(user) });
}
