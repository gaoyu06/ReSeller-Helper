import { redirect } from "next/navigation";
import { agentLoginAction, agentRegisterAction } from "@/app/auth/actions";
import { AgentRegisterForm } from "@/app/auth/agent-register-form";
import { LoginForm } from "@/app/auth/login-form";
import { getCurrentSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AgentLoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(session.role === "AGENT" ? "/agent" : "/admin");
  }

  return (
    <main className="mx-auto flex w-full max-w-[1360px] flex-1 items-center px-4 py-6 lg:px-6">
      <div className="grid w-full gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="grid gap-4">
          <div className="panel">
            <p className="text-[11px] tracking-[0.18em] text-sky-300/75">代理入口</p>
            <h1 className="mt-3 max-w-3xl font-display text-[2.8rem] leading-[1.02] text-white sm:text-[3.4rem]">
              登录工作台后，直接发码、查记录、维护自己的账号安全。
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              代理发码已经切到会话制流程，不再需要把用户名和密码反复带入每一次发码请求。
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <FeatureCard
              title="立即发码"
              description="只选择已授权类型，系统自动校验权限、额度和库存。"
            />
            <FeatureCard
              title="查看历史"
              description="快速回看最近发出的卡密和模板渲染结果。"
            />
            <FeatureCard
              title="修改密码"
              description="代理可独立改密，旧会话会在保存后立即失效。"
            />
          </div>
        </section>

        <div className="grid gap-4">
          <div className="flex items-center justify-center lg:justify-end">
            <LoginForm
              title="代理工作台登录"
              description="登录后即可发码、查看最近发码记录，并维护自己的账号密码。"
              submitLabel="进入代理工作台"
              hints={["alpha / alpha123456", "beta / beta123456"]}
              action={agentLoginAction}
            />
          </div>

          <AgentRegisterForm action={agentRegisterAction} />
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
