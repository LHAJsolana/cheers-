import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "cheers_session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!userId) return null;

  return prisma.user.findUnique({ where: { id: userId } });
}

export function createAuthToken(userId: string) {
  return signSession(userId);
}

export function verifyAuthToken(value: string | undefined) {
  return verifySession(value);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

function signSession(userId: string) {
  return `${userId}.${sessionSignature(userId)}`;
}

function verifySession(value: string | undefined) {
  if (!value) return null;
  const [userId, signature] = value.split(".");
  if (!userId || !signature) return null;

  const expected = sessionSignature(userId);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length) return null;

  return timingSafeEqual(expectedBuffer, actualBuffer) ? userId : null;
}

function sessionSignature(userId: string) {
  return createHmac("sha256", process.env.SESSION_SECRET ?? "local-dev-secret-change-me")
    .update(userId)
    .digest("hex");
}
