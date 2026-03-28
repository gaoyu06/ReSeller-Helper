import { CodeStatus, Prisma } from "@prisma/client";
import { getStatsRange } from "@/lib/stats";
import { prisma } from "@/lib/prisma";

type IssueInput = {
  agentId: string;
  codeTypeId: string;
};

export type IssueCodeResult = {
  renderedContent: string;
  codeValue: string;
  agentName: string;
  codeTypeName: string;
};

const MAX_RETRIES = 3;

export async function issueCode(input: IssueInput): Promise<IssueCodeResult> {
  if (!input.agentId.trim() || !input.codeTypeId.trim()) {
    throw new Error("缺少代理会话或卡密类型。");
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const agent = await tx.agent.findUnique({
          where: { id: input.agentId },
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        });

        if (!agent || !agent.isActive) {
          throw new Error("当前代理会话无效。");
        }

        const codeType = await tx.codeType.findUnique({
          where: { id: input.codeTypeId },
        });

        if (!codeType || !codeType.isActive) {
          throw new Error("所选卡密类型当前不可用。");
        }

        const permission = await tx.agentCodeType.findUnique({
          where: {
            agentId_codeTypeId: {
              agentId: agent.id,
              codeTypeId: codeType.id,
            },
          },
        });

        if (!permission) {
          throw new Error("当前代理没有该类型的发码权限。");
        }

        const usageStats = await getPermissionUsageStats(tx, agent.id, codeType.id);

        if (isLimitReached(usageStats.today, permission.dailyLimit)) {
          throw new Error(`${codeType.name} 今日额度已用尽。`);
        }

        if (isLimitReached(usageStats.month, permission.monthlyLimit)) {
          throw new Error(`${codeType.name} 本月额度已用尽。`);
        }

        if (isLimitReached(usageStats.total, permission.totalLimit)) {
          throw new Error(`${codeType.name} 总额度已用尽。`);
        }

        const candidate = await tx.code.findFirst({
          where: {
            codeTypeId: input.codeTypeId,
            status: CodeStatus.UNUSED,
          },
          orderBy: {
            importedAt: "asc",
          },
        });

        if (!candidate) {
          throw new Error("该类型已没有可用库存。");
        }

        const updateResult = await tx.code.updateMany({
          where: {
            id: candidate.id,
            status: CodeStatus.UNUSED,
          },
          data: {
            status: CodeStatus.USED,
            usedAt: new Date(),
            usedByAgentId: agent.id,
          },
        });

        if (updateResult.count !== 1) {
          throw new Error("库存竞争冲突，请重试。");
        }

        const template = await tx.template.findUnique({
          where: {
            agentId_codeTypeId: {
              agentId: agent.id,
              codeTypeId: codeType.id,
            },
          },
        });

        const chosenTemplate =
          template?.enabled && template.content.trim()
            ? template.content
            : codeType.defaultTemplate;

        const renderedContent = renderTemplate(chosenTemplate, candidate.value);

        await tx.usageLog.create({
          data: {
            agentId: agent.id,
            codeTypeId: codeType.id,
            codeId: candidate.id,
            renderedContent,
          },
        });

        return {
          renderedContent,
          codeValue: candidate.value,
          agentName: agent.name,
          codeTypeName: codeType.name,
        };
      });
    } catch (error) {
      if (isRetryableRace(error) && attempt < MAX_RETRIES - 1) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("多次重试后仍未成功分配卡密。");
}

async function getPermissionUsageStats(
  tx: Prisma.TransactionClient,
  agentId: string,
  codeTypeId: string,
) {
  const range = getStatsRange();

  const [today, month, total] = await Promise.all([
    tx.usageLog.count({
      where: {
        agentId,
        codeTypeId,
        createdAt: {
          gte: range.today.start,
          lte: range.today.end,
        },
      },
    }),
    tx.usageLog.count({
      where: {
        agentId,
        codeTypeId,
        createdAt: {
          gte: range.month.start,
          lte: range.month.end,
        },
      },
    }),
    tx.usageLog.count({
      where: {
        agentId,
        codeTypeId,
      },
    }),
  ]);

  return { today, month, total };
}

function renderTemplate(template: string, code: string) {
  return template.replaceAll("{code}", code);
}

function isRetryableRace(error: unknown) {
  return error instanceof Error && error.message.includes("冲突");
}

function isLimitReached(used: number, limit: number) {
  return limit > 0 && used >= limit;
}
