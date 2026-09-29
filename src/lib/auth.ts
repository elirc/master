import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/constants";

const SESSION_DAYS = 30;
const LOCAL_USER_BASE = "local-user";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function buildSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function sessionExpiryDate() {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function createSession(userId: string) {
  const token = buildSessionToken();
  const expiresAt = sessionExpiryDate();

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } });
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  return session;
}

export async function requireUser() {
  const session = await getSession();
  if (session) {
    return session.user;
  }

  const existing = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    await prisma.userSettings.upsert({
      where: { userId: existing.id },
      create: {
        userId: existing.id,
        dayStartMin: 6 * 60,
        dayEndMin: 23 * 60,
        timerRoundingMin: 0,
      },
      update: {},
    });

    return existing;
  }

  const randomSuffix = crypto.randomBytes(3).toString("hex");
  const username = `${LOCAL_USER_BASE}-${randomSuffix}`;
  const passwordHash = await hashPassword(crypto.randomBytes(16).toString("hex"));

  return prisma.user.create({
    data: {
      username,
      passwordHash,
      settings: {
        create: {
          dayStartMin: 6 * 60,
          dayEndMin: 23 * 60,
          timerRoundingMin: 0,
        },
      },
    },
  });
}

export async function requireUserOrRedirect() {
  return requireUser();
}

export async function requireUserId() {
  const user = await requireUser();
  return user.id;
}



