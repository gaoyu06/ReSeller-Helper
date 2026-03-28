import { redirect } from "next/navigation";
import { adminLoginAction, agentLoginAction } from "@/app/auth/actions";
import { LoginForm } from "@/app/auth/login-form";
import { getCurrentSession } from "@/lib/auth";

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
    <main className="page-shell mx-auto flex w-full max-w-[520px] flex-1 items-center justify-center px-4 py-8 lg:px-8">
      <div className="w-full">
        <LoginForm
          title={role === "admin" ? "管理员登录" : "代理登录"}
          submitLabel="登录"
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
