import { AgentReviewStatus, CodeStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStatsRange } from "@/lib/stats";

export async function getDashboardData() {
  const range = getStatsRange();

  const [
    codeTypes,
    agents,
    templates,
    permissions,
    recentCodes,
    usageLogs,
    inventory,
    todayIssued,
    monthIssued,
    totalIssued,
    pendingAgents,
  ] = await Promise.all([
    prisma.codeType.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            codes: true,
            usageLogs: true,
            permissions: true,
            templates: true,
          },
        },
      },
    }),
    prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        permissions: {
          include: {
            codeType: true,
          },
        },
        _count: {
          select: {
            usageLogs: true,
            templates: true,
          },
        },
      },
    }),
    prisma.template.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        agent: true,
        codeType: true,
      },
    }),
    prisma.agentCodeType.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        agent: true,
        codeType: true,
      },
    }),
    prisma.code.findMany({
      orderBy: { importedAt: "desc" },
      take: 20,
      include: {
        codeType: true,
        usedByAgent: true,
      },
    }),
    prisma.usageLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        agent: true,
        codeType: true,
        code: true,
      },
    }),
    prisma.code.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
    prisma.usageLog.count({
      where: {
        createdAt: {
          gte: range.today.start,
          lte: range.today.end,
        },
      },
    }),
    prisma.usageLog.count({
      where: {
        createdAt: {
          gte: range.month.start,
          lte: range.month.end,
        },
      },
    }),
    prisma.usageLog.count(),
    prisma.agent.count({
      where: {
        reviewStatus: AgentReviewStatus.PENDING,
      },
    }),
  ]);

  const stock = inventory.reduce(
    (acc, item) => {
      acc[item.status] = item._count._all;
      return acc;
    },
    {
      [CodeStatus.UNUSED]: 0,
      [CodeStatus.USED]: 0,
      [CodeStatus.DISABLED]: 0,
    } as Record<CodeStatus, number>,
  );

  return {
    codeTypes,
    agents,
    templates,
    permissions,
    recentCodes,
    usageLogs,
    pendingAgents: agents.filter((agent) => agent.reviewStatus === AgentReviewStatus.PENDING),
    stats: {
      todayIssued,
      monthIssued,
      totalIssued,
      unusedCodes: stock[CodeStatus.UNUSED],
      usedCodes: stock[CodeStatus.USED],
      disabledCodes: stock[CodeStatus.DISABLED],
      pendingAgents,
    },
  };
}
