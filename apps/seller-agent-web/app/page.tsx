import Link from "next/link";
import { Boxes, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  const session = await getCurrentSession();
  const dashboard = await getDashboardData();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.14),_transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-4 py-5 lg:px-6">
        <header className="flex items-center justify-between gap-4 py-3">
          <div>
            <div className="font-display text-2xl text-white">代理发码系统</div>
            <div className="text-[11px] tracking-[0.12em] text-zinc-500">项目 A / Web</div>
          </div>
          <div className="flex items-center gap-2.5">
            {session ? (
              <Button asChild>
                <Link href={session.role === "ADMIN" ? "/admin" : "/agent"}>
                  {session.role === "ADMIN" ? "进入管理后台" : "进入代理工作台"}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/admin/login">管理员登录</Link>
                </Button>
                <Button asChild>
                  <Link href="/agent/login">代理登录</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/agent/login">申请代理</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        <section className="grid flex-1 items-start gap-5 py-6 lg:grid-cols-[1.12fr_0.88fr]">
          <Card className="rounded-[30px] border-white/10 bg-[#101117]/85 shadow-[0_28px_96px_rgba(0,0,0,0.42)] backdrop-blur">
            <CardHeader className="p-6 pb-0">
              <p className="text-[11px] tracking-[0.18em] text-amber-300/75">完整业务闭环</p>
              <CardTitle className="mt-3 max-w-3xl font-display text-[3rem] leading-[1.02] sm:text-[4rem]">
                更清晰的结构，更完整的账号体系，更稳的发码流程。
              </CardTitle>
              <CardDescription className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                管理员在独立后台中维护类型、库存、模板、代理与统计；代理在独立工作台内登录、发码、查看额度与历史，全程不再把账号密码塞进每次发码请求。
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid gap-3 md:grid-cols-2">
                <Card className="rounded-[22px] border-white/8 bg-[#14161d]/80">
                  <CardContent className="p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-200">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <CardTitle className="mt-3 text-lg">管理后台</CardTitle>
                    <CardDescription className="mt-1.5 text-sm leading-6 text-zinc-400">
                      按页面拆分总览、卡密类型、库存、代理、模板和日志，结构更清楚。
                    </CardDescription>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/admin/login">进入后台</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-[22px] border-white/8 bg-[#14161d]/80">
                  <CardContent className="p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-200">
                      <LockKeyhole className="h-4 w-4" />
                    </div>
                    <CardTitle className="mt-3 text-lg">代理工作台</CardTitle>
                    <CardDescription className="mt-1.5 text-sm leading-6 text-zinc-400">
                      代理登录后即可发码、看历史、改密码，账号流程不再分散。
                    </CardDescription>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild>
                        <Link href="/agent/login">进入工作台</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/agent/login">提交申请</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            <MetricCard label="卡密类型" value={dashboard.codeTypes.length} icon={<Boxes className="h-4 w-4" />} />
            <MetricCard label="可用库存" value={dashboard.stats.unusedCodes} icon={<Sparkles className="h-4 w-4" />} />
            <MetricCard label="代理账号" value={dashboard.agents.length} icon={<ShieldCheck className="h-4 w-4" />} />

            <Card className="rounded-[22px] border-white/10 bg-[#101117]/85">
              <CardContent className="p-5">
                <div className="text-[11px] tracking-[0.08em] text-zinc-500">演示账号</div>
                <div className="mt-3 grid gap-2.5 text-sm text-zinc-300">
                  <div className="rounded-xl border border-white/6 bg-black/20 px-3.5 py-3">
                    <div className="font-medium text-white">管理员</div>
                    <div className="mt-1 text-zinc-500">admin / admin123456</div>
                  </div>
                  <div className="rounded-xl border border-white/6 bg-black/20 px-3.5 py-3">
                    <div className="font-medium text-white">代理</div>
                    <div className="mt-1 text-zinc-500">alpha / alpha123456 · beta / beta123456</div>
                  </div>
                  <div className="rounded-xl border border-sky-400/12 bg-sky-400/8 px-3.5 py-3 text-zinc-300">
                    <div className="font-medium text-white">代理注册</div>
                    <div className="mt-1 text-zinc-400">
                      新代理可先提交注册申请，审核通过后由管理员配置额度与权限。
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-[22px] border-white/10 bg-[#101117]/85">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] tracking-[0.08em] text-zinc-500">{label}</div>
          <div className="text-amber-200">{icon}</div>
        </div>
        <div className="mt-2.5 font-display text-4xl text-white">{value}</div>
      </CardContent>
    </Card>
  );
}
