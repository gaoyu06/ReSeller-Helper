import { format } from "date-fns";
import { requireAgentSession } from "@/lib/auth";
import { getAgentWorkspace } from "@/lib/agent-data";
import { AgentHomeConsole } from "@/app/agent/agent-home-console";

export default async function AgentOverviewPage() {
  const session = await requireAgentSession();
  const data = await getAgentWorkspace(session.user.id);

  return (
    <AgentHomeConsole
      agentName={data.agent.name}
      permissions={data.permissions.map((permission) => ({
        id: permission.id,
        codeTypeId: permission.codeType.id,
        name: permission.codeType.name,
        description: permission.codeType.description,
        dailyLimit: permission.dailyLimit,
        monthlyLimit: permission.monthlyLimit,
        totalLimit: permission.totalLimit,
        todayIssued: permission.stats.todayIssued,
        monthIssued: permission.stats.monthIssued,
        totalIssued: permission.stats.totalIssued,
        remainingToday: permission.stats.remainingToday,
        remainingMonth: permission.stats.remainingMonth,
        remainingTotal: permission.stats.remainingTotal,
        availableStock: permission.stats.availableStock,
      }))}
      history={data.recentUsage.map((item) => ({
        id: item.id,
        createdAt: format(item.createdAt, "yyyy-MM-dd HH:mm"),
        codeTypeName: item.codeType.name,
        codeValue: item.code.value,
        renderedContent: item.renderedContent,
      }))}
    />
  );
}
