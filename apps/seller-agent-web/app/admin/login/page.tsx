import { redirect } from "next/navigation";
import { adminLoginAction, agentLoginAction } from "@/app/auth/actions";
import { LoginForm } from "@/app/auth/login-form";
import { getCurrentSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

type SearchParams = Promise<{
  role?: string;
}>;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getCurrentSession();
  const params = await searchParams;

  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/agent");
  }

  const role = params.role === "agent" ? "agent" : "admin";

  return (
    <main className="page-shell mx-auto flex w-full max-w-[1080px] flex-1 items-center px-4 py-8 lg:px-8">
      <div className="grid w-full gap-4 lg:grid-cols-[1fr_440px]">
        <Card className="surface-muted rounded-[32px]">
          <CardContent className="grid gap-3 p-7">
            <div className="section-label">统一登录</div>
            <h1 className="font-display text-[3rem] leading-[0.96] text-[#1f1a17]">
              一个入口，
              <br />
              登录管理员或代理账号。
            </h1>
            <p className="max-w-xl text-sm leading-7 text-[#5f5347]">
              管理员进入后台，代理进入工作台。注册入口单独提供，不再和登录表单混排。
            </p>
          </CardContent>
        </Card>

        <LoginForm
          title={role === "admin" ? "账号登录" : "代理登录"}
          description={role === "admin" ? "管理员与代理共用此登录入口。" : "输入代理账号后进入工作台。"}
          submitLabel={role === "admin" ? "登录管理员账号" : "进入代理工作台"}
          action={role === "admin" ? adminLoginAction : agentLoginAction}
          tabs={[
            { href: "/admin/login?role=admin", label: "管理员登录", active: role === "admin" },
            { href: "/admin/login?role=agent", label: "代理登录", active: role === "agent" },
            { href: "/agent/register", label: "注册账号" },
          ]}
        />
      </div>
    </main>
  );
}
