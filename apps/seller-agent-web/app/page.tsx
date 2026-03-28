import Link from "next/link";
import { getCurrentSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const session = await getCurrentSession();
  const dashboard = await getDashboardData();

  return (
    <main className="page-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 py-5 lg:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-[#dfd4c6] pb-5">
          <div className="font-display text-[1.8rem] text-[#1f1a17]">代理发码系统</div>
          <div className="flex flex-wrap items-center gap-2">
            {session ? (
              <Button asChild className="text-[#f6f1ea]">
                <Link href={session.role === "ADMIN" ? "/admin" : "/agent"}>
                  {session.role === "ADMIN" ? "进入后台" : "进入工作台"}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/admin/login">登录</Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="border-[#d5c7b6] bg-[#e9dfd0] text-[#241d18] hover:bg-[#e1d5c4]"
                >
                  <Link href="/agent/register">申请代理</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        <section className="grid flex-1 content-start gap-5 py-8">
          <Card className="rounded-[32px] border-[#d9cebf] bg-[rgba(248,244,237,0.95)]">
            <CardContent className="p-7">
              <h1 className="max-w-4xl font-display text-[2.6rem] leading-[0.96] text-[#1f1a17] sm:text-[3.6rem] lg:text-[4.4rem]">
                代理发码系统
              </h1>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <SimpleMetric label="卡密类型" value={dashboard.codeTypes.length} />
                <SimpleMetric label="可用库存" value={dashboard.stats.unusedCodes} />
                <SimpleMetric label="代理账号" value={dashboard.agents.length} />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function SimpleMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[20px] border border-[#ddd2c4] bg-[#fbf7f1] px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.12em] text-[#6b5f53]">{label}</div>
      <div className="mt-2 font-display text-[2rem] leading-none text-[#1f1a17]">{value}</div>
    </div>
  );
}
