"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AgentReviewStatus } from "@prisma/client";
import { z } from "zod";
import {
  createAdminSession,
  createAgentSession,
  destroyCurrentSession,
  hashPassword,
  requireAdminSession,
  requireAgentSession,
  revokeAdminSessions,
  revokeAgentSessions,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  username: z.string().min(1, "请输入用户名。"),
  password: z.string().min(1, "请输入密码。"),
});

const agentRegisterSchema = z
  .object({
    name: z.string().min(2, "请输入至少 2 个字符的显示名称。"),
    username: z
      .string()
      .min(3, "用户名至少需要 3 个字符。")
      .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线和中划线。"),
    password: z.string().min(6, "密码至少需要 6 位字符。"),
    confirmPassword: z.string().min(1, "请再次输入密码。"),
    applicationNote: z.string().max(200, "申请说明不能超过 200 个字符。").optional(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的密码不一致。",
  });

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码。"),
    newPassword: z.string().min(6, "新密码至少需要 6 位字符。"),
    confirmPassword: z.string().min(1, "请再次输入新密码。"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的新密码不一致。",
  });

export type LoginFormState = {
  error?: string;
};

export type RegisterFormState = {
  error?: string;
  success?: string;
};

export type PasswordActionState = {
  error?: string;
  success?: string;
};

export async function adminLoginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "表单数据无效。",
    };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { username: parsed.data.username },
  });

  if (!admin || !admin.isActive) {
    return {
      error: "管理员用户名或密码错误。",
    };
  }

  const isValid = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!isValid) {
    return {
      error: "管理员用户名或密码错误。",
    };
  }

  await createAdminSession(admin.id);
  redirect("/admin");
}

export async function agentLoginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "表单数据无效。",
    };
  }

  const agent = await prisma.agent.findUnique({
    where: { username: parsed.data.username },
  });

  if (!agent) {
    return {
      error: "代理用户名或密码错误。",
    };
  }

  if (agent.reviewStatus === AgentReviewStatus.PENDING) {
    return {
      error: "你的代理注册申请还在审核中，请等待管理员审核。",
    };
  }

  if (agent.reviewStatus === AgentReviewStatus.REJECTED) {
    return {
      error: agent.reviewNote
        ? `你的代理申请未通过：${agent.reviewNote}`
        : "你的代理申请未通过，请联系管理员。",
    };
  }

  if (!agent.isActive) {
    return {
      error: "代理账号已停用，请联系管理员。",
    };
  }

  const isValid = await verifyPassword(parsed.data.password, agent.passwordHash);
  if (!isValid) {
    return {
      error: "代理用户名或密码错误。",
    };
  }

  await createAgentSession(agent.id);
  redirect("/agent");
}

export async function agentRegisterAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const parsed = agentRegisterSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    applicationNote: formData.get("applicationNote")?.toString().trim() || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "注册表单无效。",
    };
  }

  const existing = await prisma.agent.findUnique({
    where: {
      username: parsed.data.username,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    return {
      error: "该用户名已存在，请更换一个用户名。",
    };
  }

  await prisma.agent.create({
    data: {
      name: parsed.data.name,
      username: parsed.data.username,
      passwordHash: await hashPassword(parsed.data.password),
      reviewStatus: AgentReviewStatus.PENDING,
      applicationNote: parsed.data.applicationNote,
      isActive: false,
      dailyLimit: 0,
      monthlyLimit: 0,
      totalLimit: 0,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/agent/login");

  return {
    success: "注册申请已提交，等待管理员审核后即可登录。",
  };
}

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/");
}

export async function changeAdminPasswordAction(
  _prevState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const session = await requireAdminSession();

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "密码表单无效。",
    };
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return {
      error: "新密码不能与当前密码相同。",
    };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      isActive: true,
      passwordHash: true,
    },
  });

  if (!admin || !admin.isActive) {
    return {
      error: "管理员账号不存在或已停用。",
    };
  }

  const matched = await verifyPassword(parsed.data.currentPassword, admin.passwordHash);

  if (!matched) {
    return {
      error: "当前密码不正确。",
    };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
    },
  });

  await revokeAdminSessions(admin.id);
  await createAdminSession(admin.id);
  revalidatePath("/admin");
  revalidatePath("/admin/security");

  return {
    success: "管理员密码已更新。",
  };
}

export async function changeAgentPasswordAction(
  _prevState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const session = await requireAgentSession();

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "密码表单无效。",
    };
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return {
      error: "新密码不能与当前密码相同。",
    };
  }

  const agent = await prisma.agent.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      isActive: true,
      passwordHash: true,
    },
  });

  if (!agent || !agent.isActive) {
    return {
      error: "代理账号不存在或已停用。",
    };
  }

  const matched = await verifyPassword(parsed.data.currentPassword, agent.passwordHash);

  if (!matched) {
    return {
      error: "当前密码不正确。",
    };
  }

  await prisma.agent.update({
    where: { id: agent.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
    },
  });

  await revokeAgentSessions(agent.id);
  await createAgentSession(agent.id);
  revalidatePath("/agent");
  revalidatePath("/agent/security");

  return {
    success: "代理密码已更新。",
  };
}
