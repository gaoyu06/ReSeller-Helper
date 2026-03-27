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
          dailyLimit: true,
          monthlyLimit: true,
          totalLimit: true,
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

  return {
    agent,
    permissions,
    recentUsage,
    stats: {
      todayIssued,
      monthIssued,
      totalIssued,
      remainingToday: Math.max(agent.dailyLimit - todayIssued, 0),
      remainingMonth: Math.max(agent.monthlyLimit - monthIssued, 0),
      remainingTotal: Math.max(agent.totalLimit - totalIssued, 0),
    },
  };
}
