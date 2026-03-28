import { format } from "date-fns";
import { requireAgentSession } from "@/lib/auth";
import { getAgentWorkspace } from "@/lib/agent-data";
import { AgentPasswordDialog } from "@/components/admin-dialog-forms";
import { SectionHeader } from "@/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";

export default async function AgentSecurityPage() {
  const session = await requireAgentSession();
  const data = await getAgentWorkspace(session.user.id);

  return (
    <main className="grid gap-4 py-1">
      <SectionHeader eyebrow="账号安全" title="账号安全" />

      <div className="flex justify-end">
        <AgentPasswordDialog />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="panel p-0">
          <CardContent className="px-4 py-4">
            <div className="text-[11px] tracking-[0.08em] text-[#8f8172]">代理账号</div>
            <div className="mt-1.5 text-lg font-semibold text-[#1f1a17]">{data.agent.name}</div>
            <div className="mt-1 text-sm text-[#8f8172]">@{data.agent.username}</div>
          </CardContent>
        </Card>
        <Card className="panel p-0">
          <CardContent className="px-4 py-4">
            <div className="text-[11px] tracking-[0.08em] text-[#8f8172]">账号状态</div>
            <div className="mt-1.5 text-lg font-semibold text-[#1f1a17]">
              {data.agent.isActive ? "启用" : "停用"}
            </div>
            <div className="mt-1 text-sm text-[#5f5347]">可发类型 {data.stats.availableTypes}</div>
          </CardContent>
        </Card>
        <Card className="panel p-0">
          <CardContent className="px-4 py-4">
            <div className="text-[11px] tracking-[0.08em] text-[#8f8172]">使用情况</div>
            <div className="mt-1.5 text-sm text-[#5f5347]">
              累计发码 {data.stats.totalIssued} 次
            </div>
            <div className="mt-1 text-sm text-[#5f5347]">
              会话到期 {format(session.expiresAt, "yyyy-MM-dd HH:mm")}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
