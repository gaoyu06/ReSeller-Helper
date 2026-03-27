import { format } from "date-fns";
import { changeAgentPasswordAction } from "@/app/auth/actions";
import { requireAgentSession } from "@/lib/auth";
import { getAgentWorkspace } from "@/lib/agent-data";
import { SectionHeader } from "@/components/admin-ui";
import { PasswordChangeForm } from "@/components/password-change-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function AgentSecurityPage() {
  const session = await requireAgentSession();
  const data = await getAgentWorkspace(session.user.id);

  return (
    <main className="grid gap-5 py-1">
      <SectionHeader
        eyebrow="账号安全"
        title="维护你的工作台登录凭据。"
        description="代理可自行修改密码，无需管理员介入。保存成功后，当前代理账号的旧会话会立即失效。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="panel p-0">
          <CardContent className="grid gap-3 p-5">
            <div className="section-label">当前账号</div>
            <Card className="rounded-xl border-white/6 bg-black/20 shadow-none">
              <CardContent className="px-3.5 py-3">
                <div className="text-[11px] tracking-[0.08em] text-zinc-500">代理名称</div>
                <div className="mt-1.5 text-lg font-semibold text-white">{data.agent.name}</div>
                <div className="mt-1 text-sm text-zinc-500">@{data.agent.username}</div>
              </CardContent>
            </Card>
            <div className="grid gap-3 md:grid-cols-3">
              <Card className="rounded-xl border-white/6 bg-black/20 shadow-none">
                <CardContent className="px-3.5 py-3">
                  <div className="text-[11px] tracking-[0.08em] text-zinc-500">今日剩余</div>
                  <div className="mt-1.5 text-xl font-semibold text-white">{data.stats.remainingToday}</div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-white/6 bg-black/20 shadow-none">
                <CardContent className="px-3.5 py-3">
                  <div className="text-[11px] tracking-[0.08em] text-zinc-500">本月剩余</div>
                  <div className="mt-1.5 text-xl font-semibold text-white">{data.stats.remainingMonth}</div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-white/6 bg-black/20 shadow-none">
                <CardContent className="px-3.5 py-3">
                  <div className="text-[11px] tracking-[0.08em] text-zinc-500">会话到期时间</div>
                  <div className="mt-1.5 text-sm text-zinc-300">
                    {format(session.expiresAt, "yyyy-MM-dd HH:mm")}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <PasswordChangeForm
          title="修改代理密码"
          description="建议为代理账号设置强密码。新密码保存后，系统会撤销旧代理会话。"
          submitLabel="保存新密码"
          action={changeAgentPasswordAction}
        />
      </div>
    </main>
  );
}
