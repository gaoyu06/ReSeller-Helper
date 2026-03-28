"use server";

import { revalidatePath } from "next/cache";
import { requireAgentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function upsertAgentTemplate(formData: FormData) {
  const session = await requireAgentSession();

  const codeTypeId = requiredString(formData.get("codeTypeId"), "缺少卡密类型。");
  const content = requiredString(formData.get("content"), "请输入模板内容。");
  const enabled = formData.get("enabled")?.toString() === "on";

  const permission = await prisma.agentCodeType.findUnique({
    where: {
      agentId_codeTypeId: {
        agentId: session.user.id,
        codeTypeId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!permission) {
    throw new Error("当前类型未授权，不能设置模板。");
  }

  await prisma.template.upsert({
    where: {
      agentId_codeTypeId: {
        agentId: session.user.id,
        codeTypeId,
      },
    },
    update: {
      content,
      enabled,
    },
    create: {
      agentId: session.user.id,
      codeTypeId,
      content,
      enabled,
    },
  });

  revalidatePath("/agent");
  revalidatePath("/agent/templates");
}

export async function deleteAgentTemplate(formData: FormData) {
  const session = await requireAgentSession();
  const id = requiredString(formData.get("id"), "缺少模板 ID。");

  await prisma.template.deleteMany({
    where: {
      id,
      agentId: session.user.id,
    },
  });

  revalidatePath("/agent");
  revalidatePath("/agent/templates");
}

function requiredString(value: FormDataEntryValue | null, message: string) {
  const result = value?.toString().trim();
  if (!result) {
    throw new Error(message);
  }

  return result;
}
