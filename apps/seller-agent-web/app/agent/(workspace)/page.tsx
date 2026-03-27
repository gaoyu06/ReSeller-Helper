import Link from "next/link";
import { Clock3, KeyRound, Layers3, SendHorizontal } from "lucide-react";
import { requireAgentSession } from "@/lib/auth";
import { getAgentWorkspace } from "@/lib/agent-data";
import { Badge, StatTile } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default async function AgentOverviewPage() {
  const session = await requireAgentSession();
  const data = await getAgentWorkspace(session.user.id);

  return (
    <main className="grid gap-5 py-1">
      <section className="grid gap-3 lg:grid-cols-3">
        <StatTile
          label="今日发码"
          value={data.stats.todayIssued}
          icon={<SendHorizontal className="h-4 w-4" />}
        />
        <StatTile
          label="本月发码"
          value={data.stats.monthIssued}
          icon={<Layers3 className="h-4 w-4" />}
        />
        <StatTile
          label="累计发码"
          value={data.stats.totalIssued}
          icon={<Clock3 className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="panel p-0">
          <CardContent className="p-5">
            <p className="text-[11px] tracking-[0.08em] text-zinc-500">当前额度</p>
            <h1 className="mt-2.5 text-[1.7rem] font-semibold text-white">{data.agent.name}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              今日剩余：{data.stats.remainingToday} / {data.agent.dailyLimit}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              本月剩余：{data.stats.remainingMonth} / {data.agent.monthlyLimit}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              总剩余：{data.stats.remainingTotal} / {data.agent.totalLimit}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button asChild>
                <Link href="/agent/issue">开始发码</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/agent/history">查看记录</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/agent/security">账号安全</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="panel p-0">
          <CardContent className="p-5">
            <p className="text-[11px] tracking-[0.08em] text-zinc-500">已授权类型</p>
            <div className="mt-3 grid gap-2.5">
              {data.permissions.map((permission) => (
                <Card
                  key={permission.id}
                  className="rounded-xl border-white/6 bg-black/20 shadow-none"
                >
                  <CardContent className="px-3.5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-white">{permission.codeType.name}</div>
                      <Badge tone="muted">已授权</Badge>
                    </div>
                    <div className="mt-1.5 text-sm text-zinc-500">
                      {permission.codeType.description || "暂无说明"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="mt-4 rounded-xl border-amber-300/15 bg-amber-300/10 shadow-none">
              <CardContent className="px-3.5 py-3">
                <div className="flex items-center gap-2 text-amber-100">
                  <KeyRound className="h-4 w-4" />
                  <CardTitle className="text-sm font-medium text-amber-100">账号安全</CardTitle>
                </div>
                <p className="mt-1.5 text-sm text-amber-50/80">
                  修改密码后，当前账号的旧会话会立刻失效。
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
