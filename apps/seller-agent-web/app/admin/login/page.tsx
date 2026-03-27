import { redirect } from "next/navigation";
import { adminLoginAction } from "@/app/auth/actions";
import { LoginForm } from "@/app/auth/login-form";
import { getCurrentSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminLoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/agent");
  }

  return (
    <main className="mx-auto flex w-full max-w-[1360px] flex-1 items-center px-4 py-6 lg:px-6">
      <div className="grid w-full gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="grid gap-4">
          <div className="panel">
            <p className="text-[11px] tracking-[0.18em] text-amber-300/75">管理员入口</p>
            <h1 className="mt-3 max-w-3xl font-display text-[2.8rem] leading-[1.02] text-white sm:text-[3.4rem]">
              在一个后台里维护类型、库存、代理、模板与日志。
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              管理员登录后直接进入完整业务链路的控制面板，适合集中完成权限配置、库存维护与数据追踪。
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <FeatureCard
              title="卡密类型"
              description="创建类型、维护默认模板，并控制是否启用。"
            />
            <FeatureCard
              title="代理账号"
              description="配置额度、密码和发码权限，账号状态独立管理。"
            />
            <FeatureCard
              title="使用日志"
              description="按时间追踪每次发码结果，便于审计和排查。"
            />
          </div>
        </section>

        <div className="flex items-center justify-center lg:justify-end">
          <LoginForm
            title="管理员后台登录"
            description="登录后可管理卡密类型、库存、代理权限、模板与使用记录。"
            submitLabel="进入管理后台"
            hints={["admin / admin123456"]}
            action={adminLoginAction}
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-[24px] border-white/8 bg-[#11131a]/82">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-3 text-sm leading-6 text-zinc-400">
        {description}
      </CardContent>
    </Card>
  );
}
