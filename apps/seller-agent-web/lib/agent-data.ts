import { prisma } from "@/lib/prisma";
import { getStatsRange } from "@/lib/stats";

export async function getAgentWorkspace(agentId: string) {
  const range = getStatsRange();

  const [agent, permissions, recentUsage, todayIssued, monthIssued, totalIssued] =
    await Promise.all([
      prisma.agent.findUniqueOrThrow({
        where: { id: agentId },
        select: {
          id: true,
          name: true,
          username: true,
          isActive: true,
        },
      }),
      prisma.agentCodeType.findMany({
        where: {
          agentId,
          codeType: {
            isActive: true,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          codeType: true,
        },
      }),
      prisma.usageLog.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          codeType: true,
          code: true,
        },
      }),
      prisma.usageLog.count({
        where: {
          agentId,
          createdAt: {
            gte: range.today.start,
            lte: range.today.end,
          },
        },
      }),
      prisma.usageLog.count({
        where: {
          agentId,
          createdAt: {
            gte: range.month.start,
            lte: range.month.end,
          },
        },
      }),
      prisma.usageLog.count({
        where: { agentId },
      }),
    ]);

  const permissionIds = permissions.map((permission) => permission.codeTypeId);

  const [todayUsageByType, monthUsageByType, totalUsageByType, stockByType] = await Promise.all([
    prisma.usageLog.groupBy({
      by: ["codeTypeId"],
      where: {
        agentId,
        codeTypeId: {
          in: permissionIds,
        },
        createdAt: {
          gte: range.today.start,
          lte: range.today.end,
        },
      },
      _count: {
        _all: true,
      },
    }),
    prisma.usageLog.groupBy({
      by: ["codeTypeId"],
      where: {
        agentId,
        codeTypeId: {
          in: permissionIds,
        },
        createdAt: {
          gte: range.month.start,
          lte: range.month.end,
        },
      },
      _count: {
        _all: true,
      },
    }),
    prisma.usageLog.groupBy({
      by: ["codeTypeId"],
      where: {
        agentId,
        codeTypeId: {
          in: permissionIds,
        },
      },
      _count: {
        _all: true,
      },
    }),
    prisma.code.groupBy({
      by: ["codeTypeId"],
      where: {
        codeTypeId: {
          in: permissionIds,
        },
        status: "UNUSED",
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const todayMap = toCountMap(todayUsageByType);
  const monthMap = toCountMap(monthUsageByType);
  const totalMap = toCountMap(totalUsageByType);
  const stockMap = toCountMap(stockByType);

  const permissionSummaries = permissions.map((permission) => {
    const today = todayMap.get(permission.codeTypeId) ?? 0;
    const month = monthMap.get(permission.codeTypeId) ?? 0;
    const total = totalMap.get(permission.codeTypeId) ?? 0;
    const stock = stockMap.get(permission.codeTypeId) ?? 0;

    return {
      ...permission,
      stats: {
        todayIssued: today,
        monthIssued: month,
        totalIssued: total,
        remainingToday: getRemainingLimit(permission.dailyLimit, today),
        remainingMonth: getRemainingLimit(permission.monthlyLimit, month),
        remainingTotal: getRemainingLimit(permission.totalLimit, total),
        availableStock: stock,
      },
    };
  });

  return {
    agent,
    permissions: permissionSummaries,
    recentUsage,
    stats: {
      todayIssued,
      monthIssued,
      totalIssued,
      availableTypes: permissionSummaries.length,
    },
  };
}

function toCountMap(
  rows: Array<{
    codeTypeId: string;
    _count: {
      _all: number;
    };
  }>,
) {
  return new Map(rows.map((row) => [row.codeTypeId, row._count._all]));
}

function getRemainingLimit(limit: number, used: number) {
  if (limit <= 0) {
    return null;
  }

  return Math.max(limit - used, 0);
}
