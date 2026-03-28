import "server-only";

import { compare, hash } from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { AgentReviewStatus, SessionRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "seller_session";
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 12;
const LONG_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

type SessionResult =
  | {
      role: "ADMIN";
      sessionId: string;
      expiresAt: Date;
      user: {
        id: string;
        username: string;
        name: string;
      };
    }
  | {
      role: "AGENT";
      sessionId: string;
      expiresAt: Date;
      user: {
        id: string;
        username: string;
        name: string;
      };
    };

export async function getCurrentSession(): Promise<SessionResult | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
    include: {
      admin: true,
      agent: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: { id: session.id },
    });
    return null;
  }

  if (session.role === SessionRole.ADMIN) {
    if (!session.admin || !session.admin.isActive) {
      await prisma.session.delete({
        where: { id: session.id },
      });
      return null;
    }

    return {
      role: "ADMIN",
      sessionId: session.id,
      expiresAt: session.expiresAt,
      user: {
        id: session.admin.id,
        username: session.admin.username,
        name: session.admin.name,
      },
    };
  }

  if (
    !session.agent ||
    !session.agent.isActive ||
    session.agent.reviewStatus !== AgentReviewStatus.APPROVED
  ) {
    await prisma.session.delete({
      where: { id: session.id },
    });
    return null;
  }

  return {
    role: "AGENT",
    sessionId: session.id,
    expiresAt: session.expiresAt,
    user: {
      id: session.agent.id,
      username: session.agent.username,
      name: session.agent.name,
    },
  };
}

export async function createAdminSession(adminId: string, options?: { rememberMe?: boolean }) {
  const admin = await prisma.adminUser.findUniqueOrThrow({
    where: { id: adminId },
  });

  await createSession({
    role: SessionRole.ADMIN,
    adminId: admin.id,
    rememberMe: options?.rememberMe,
  });
}

export async function createAgentSession(agentId: string, options?: { rememberMe?: boolean }) {
  const agent = await prisma.agent.findUniqueOrThrow({
    where: { id: agentId },
  });

  if (!agent.isActive || agent.reviewStatus !== AgentReviewStatus.APPROVED) {
    throw new Error("代理账号尚未通过审核或已停用。");
  }

  await createSession({
    role: SessionRole.AGENT,
    agentId: agent.id,
    rememberMe: options?.rememberMe,
  });
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function requireAdminSession() {
  const session = await getCurrentSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return session;
}

export async function requireAgentSession() {
  const session = await getCurrentSession();

  if (!session || session.role !== "AGENT") {
    redirect("/agent/login");
  }

  return session;
}

export async function revokeAdminSessions(adminId: string) {
  await prisma.session.deleteMany({
    where: {
      role: SessionRole.ADMIN,
      adminId,
    },
  });
}

export async function revokeAgentSessions(agentId: string) {
  await prisma.session.deleteMany({
    where: {
      role: SessionRole.AGENT,
      agentId,
    },
  });
}

async function createSession(payload: {
  role: SessionRole;
  adminId?: string;
  agentId?: string;
  rememberMe?: boolean;
}) {
  const token = randomBytes(32).toString("hex");
  const ttlSeconds = payload.rememberMe ? LONG_SESSION_TTL_SECONDS : DEFAULT_SESSION_TTL_SECONDS;
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      role: payload.role,
      adminId: payload.adminId,
      agentId: payload.agentId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ttlSeconds,
  });
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
