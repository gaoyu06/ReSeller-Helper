"use server";

import { AgentReviewStatus, CodeStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hashPassword, requireAdminSession, revokeAgentSessions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const codeTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  defaultTemplate: z.string().min(3),
  isActive: z.string().optional(),
});

const agentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  username: z.string().min(2),
  password: z.string().optional(),
  dailyLimit: z.coerce.number().int().min(1),
  monthlyLimit: z.coerce.number().int().min(1),
  totalLimit: z.coerce.number().int().min(1),
  isActive: z.string().optional(),
});

const reviewAgentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  dailyLimit: z.coerce.number().int().min(1),
  monthlyLimit: z.coerce.number().int().min(1),
  totalLimit: z.coerce.number().int().min(1),
  isActive: z.string().optional(),
  reviewNote: z.string().optional(),
});

export async function upsertCodeType(formData: FormData) {
  await requireAdminSession();

  const parsed = codeTypeSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    name: formData.get("name")?.toString(),
    slug: normalizeSlug(formData.get("slug")?.toString() || formData.get("name")?.toString() || ""),
    description: optionalText(formData.get("description")),
    defaultTemplate: formData.get("defaultTemplate")?.toString(),
    isActive: formData.get("isActive")?.toString(),
  });

  if (parsed.id) {
    await prisma.codeType.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        defaultTemplate: parsed.defaultTemplate,
        isActive: parsed.isActive === "on",
      },
    });
  } else {
    await prisma.codeType.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        defaultTemplate: parsed.defaultTemplate,
        isActive: parsed.isActive === "on" || parsed.isActive === undefined,
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function toggleCodeTypeStatus(formData: FormData) {
  await requireAdminSession();

  const id = requiredString(formData.get("id"), "缺少代码类型 ID。");
  const current = requiredString(formData.get("current"), "缺少当前状态。");

  await prisma.codeType.update({
    where: { id },
    data: {
      isActive: current !== "true",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function upsertAgent(formData: FormData) {
  await requireAdminSession();

  const parsed = agentSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    name: formData.get("name")?.toString(),
    username: formData.get("username")?.toString(),
    password: formData.get("password")?.toString() || undefined,
    dailyLimit: formData.get("dailyLimit"),
    monthlyLimit: formData.get("monthlyLimit"),
    totalLimit: formData.get("totalLimit"),
    isActive: formData.get("isActive")?.toString(),
  });

  if (parsed.monthlyLimit < parsed.dailyLimit) {
    throw new Error("月额度必须大于或等于日额度。");
  }

  if (parsed.totalLimit < parsed.monthlyLimit) {
    throw new Error("总额度必须大于或等于月额度。");
  }

  if (parsed.id) {
    const data: {
      name: string;
      username: string;
      dailyLimit: number;
      monthlyLimit: number;
      totalLimit: number;
      isActive: boolean;
      passwordHash?: string;
    } = {
      name: parsed.name,
      username: parsed.username,
      dailyLimit: parsed.dailyLimit,
      monthlyLimit: parsed.monthlyLimit,
      totalLimit: parsed.totalLimit,
      isActive: parsed.isActive === "on",
    };

    if (parsed.password?.trim()) {
      if (parsed.password.trim().length < 6) {
        throw new Error("密码至少需要 6 位。");
      }

      data.passwordHash = await hashPassword(parsed.password.trim());
    }

    await prisma.agent.update({
      where: { id: parsed.id },
      data,
    });

    if (data.passwordHash || !data.isActive) {
      await revokeAgentSessions(parsed.id);
    }
  } else {
    if (!parsed.password?.trim() || parsed.password.trim().length < 6) {
      throw new Error("新建代理时必须填写至少 6 位的密码。");
    }

    await prisma.agent.create({
      data: {
        name: parsed.name,
        username: parsed.username,
        passwordHash: await hashPassword(parsed.password.trim()),
        reviewStatus: AgentReviewStatus.APPROVED,
        reviewedAt: new Date(),
        dailyLimit: parsed.dailyLimit,
        monthlyLimit: parsed.monthlyLimit,
        totalLimit: parsed.totalLimit,
        isActive: parsed.isActive === "on" || parsed.isActive === undefined,
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/agent");
}

export async function approveAgentApplication(formData: FormData) {
  await requireAdminSession();

  const parsed = reviewAgentSchema.parse({
    id: formData.get("id")?.toString(),
    name: formData.get("name")?.toString(),
    dailyLimit: formData.get("dailyLimit"),
    monthlyLimit: formData.get("monthlyLimit"),
    totalLimit: formData.get("totalLimit"),
    isActive: formData.get("isActive")?.toString(),
    reviewNote: optionalText(formData.get("reviewNote")),
  });

  if (parsed.monthlyLimit < parsed.dailyLimit) {
    throw new Error("月额度必须大于或等于日额度。");
  }

  if (parsed.totalLimit < parsed.monthlyLimit) {
    throw new Error("总额度必须大于或等于月额度。");
  }

  await prisma.agent.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      reviewStatus: AgentReviewStatus.APPROVED,
      reviewNote: parsed.reviewNote,
      reviewedAt: new Date(),
      isActive: parsed.isActive === "on" || parsed.isActive === undefined,
      dailyLimit: parsed.dailyLimit,
      monthlyLimit: parsed.monthlyLimit,
      totalLimit: parsed.totalLimit,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectAgentApplication(formData: FormData) {
  await requireAdminSession();

  const id = requiredString(formData.get("id"), "缺少代理 ID。");
  const reviewNote = optionalText(formData.get("reviewNote"));

  await prisma.agent.update({
    where: { id },
    data: {
      reviewStatus: AgentReviewStatus.REJECTED,
      reviewNote,
      reviewedAt: new Date(),
      isActive: false,
      dailyLimit: 1,
      monthlyLimit: 1,
      totalLimit: 1,
    },
  });

  await revokeAgentSessions(id);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function toggleAgentStatus(formData: FormData) {
  await requireAdminSession();

  const id = requiredString(formData.get("id"), "缺少代理 ID。");
  const current = requiredString(formData.get("current"), "缺少当前状态。");

  await prisma.agent.update({
    where: { id },
    data: {
      isActive: current !== "true",
    },
  });

  if (current === "true") {
    await revokeAgentSessions(id);
  }

  revalidatePath("/admin");
  revalidatePath("/agent");
}

export async function importCodes(formData: FormData) {
  await requireAdminSession();

  const codeTypeId = requiredString(formData.get("codeTypeId"), "请选择代码类型。");
  const importBatch = optionalText(formData.get("importBatch"));
  const content = requiredString(formData.get("codes"), "请输入要导入的卡密。");

  const codes = Array.from(
    new Set(
      content
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

  if (codes.length === 0) {
    throw new Error("请至少输入一条卡密。");
  }

  const existing = await prisma.code.findMany({
    where: {
      value: {
        in: codes,
      },
    },
    select: {
      value: true,
    },
  });

  const existingValues = new Set(existing.map((item) => item.value));
  const valuesToInsert = codes.filter((value) => !existingValues.has(value));

  if (valuesToInsert.length === 0) {
    throw new Error("提交的卡密已全部存在。");
  }

  await prisma.code.createMany({
    data: valuesToInsert.map((value) => ({
      codeTypeId,
      value,
      importBatch,
    })),
  });

  revalidatePath("/admin");
}

export async function updateCodeStatus(formData: FormData) {
  await requireAdminSession();

  const id = requiredString(formData.get("id"), "缺少卡密 ID。");
  const status = requiredString(formData.get("status"), "缺少状态。");

  if (!Object.values(CodeStatus).includes(status as CodeStatus)) {
    throw new Error("卡密状态不合法。");
  }

  await prisma.code.update({
    where: { id },
    data: {
      status: status as CodeStatus,
      usedAt: status === CodeStatus.USED ? new Date() : null,
      usedByAgentId: status === CodeStatus.USED ? undefined : null,
    },
  });

  revalidatePath("/admin");
}

export async function grantPermission(formData: FormData) {
  await requireAdminSession();

  const agentId = requiredString(formData.get("agentId"), "缺少代理 ID。");
  const codeTypeId = requiredString(formData.get("codeTypeId"), "缺少代码类型 ID。");

  await prisma.agentCodeType.upsert({
    where: {
      agentId_codeTypeId: {
        agentId,
        codeTypeId,
      },
    },
    update: {},
    create: {
      agentId,
      codeTypeId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/agent");
}

export async function revokePermission(formData: FormData) {
  await requireAdminSession();

  const id = requiredString(formData.get("id"), "缺少权限 ID。");

  await prisma.agentCodeType.delete({
    where: { id },
  });

  revalidatePath("/admin");
  revalidatePath("/agent");
}

export async function upsertTemplate(formData: FormData) {
  await requireAdminSession();

  const agentId = requiredString(formData.get("agentId"), "缺少代理 ID。");
  const codeTypeId = requiredString(formData.get("codeTypeId"), "缺少代码类型 ID。");
  const content = requiredString(formData.get("content"), "请输入模板内容。");
  const enabled = formData.get("enabled")?.toString() === "on";

  await prisma.template.upsert({
    where: {
      agentId_codeTypeId: {
        agentId,
        codeTypeId,
      },
    },
    update: {
      content,
      enabled,
    },
    create: {
      agentId,
      codeTypeId,
      content,
      enabled,
    },
  });

  revalidatePath("/admin");
}

export async function deleteTemplate(formData: FormData) {
  await requireAdminSession();

  const id = requiredString(formData.get("id"), "缺少模板 ID。");

  await prisma.template.delete({
    where: { id },
  });

  revalidatePath("/admin");
}

function requiredString(value: FormDataEntryValue | null, message: string) {
  const result = value?.toString().trim();
  if (!result) {
    throw new Error(message);
  }

  return result;
}

function optionalText(value: FormDataEntryValue | null) {
  const result = value?.toString().trim();
  return result ? result : undefined;
}

function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
