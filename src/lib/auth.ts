import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { User, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const COOKIE = "blog_admin_session";
const DEV_SECRET_FALLBACK = "dev-session-secret-change-me";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const RESET_TTL_MS = 1000 * 60 * 60;
const MIN_PASSWORD_LENGTH = 8;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function assertSessionSecret() {
  if (process.env.NODE_ENV !== "production") return;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (
    !sessionSecret ||
    sessionSecret === DEV_SECRET_FALLBACK ||
    sessionSecret === "generate-a-long-random-string"
  ) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set to a long random value in production",
    );
  }
}

function secret() {
  assertSessionSecret();
  return process.env.ADMIN_SESSION_SECRET || DEV_SECRET_FALLBACK;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function createSessionToken(userId: string) {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(
  token: string | undefined | null,
): { userId: string; createdAt: number } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, ts, sig] = parts;
  if (!userId || !ts || !sig) return null;
  const payload = `${userId}.${ts}`;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const createdAt = Number(ts);
  if (!Number.isFinite(createdAt)) return null;
  if (Date.now() - createdAt > SESSION_MAX_AGE_MS) return null;
  return { userId, createdAt };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const parsed = parseSessionToken(jar.get(COOKIE)?.value);
  if (!parsed) return null;
  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return Boolean(await getSessionUser());
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdminUser(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }
  return null;
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return null;
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  return ok ? user : null;
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createResetTokenValue() {
  return randomBytes(32).toString("hex");
}

export async function createPasswordResetToken(userId: string) {
  const token = createResetTokenValue();
  const tokenHash = hashToken(token);
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  });
  return token;
}

export async function consumePasswordResetToken(token: string) {
  const tokenHash = hashToken(token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
    return null;
  }
  await prisma.passwordResetToken.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  return row.user;
}

export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export { COOKIE as ADMIN_COOKIE, MIN_PASSWORD_LENGTH };
