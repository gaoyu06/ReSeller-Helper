import { redirect } from "next/navigation";
import { agentRegisterAction } from "@/app/auth/actions";
import { AgentRegisterForm } from "@/app/auth/agent-register-form";
import { getCurrentSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function AgentRegisterPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(session.role === "AGENT" ? "/agent" : "/admin");
  }

  return (
    <main className="page-shell mx-auto flex w-full max-w-[1080px] flex-1 items-center px-4 py-8 lg:px-8">
      <div className="grid w-full gap-4 lg:grid-cols-[1fr_460px]">
        <Card className="surface-muted rounded-[32px]">
          <CardContent className="grid gap-3 p-7">
            <div className="section-label">代理注册</div>
            <h1 className="font-display text-[3rem] leading-[0.96] text-[#1f1a17]">
              提交代理申请，
              <br />
              审核通过后再登录。
            </h1>
            <p className="max-w-xl text-sm leading-7 text-[#5f5347]">
              注册和登录分开，避免把申请流程塞进登录页里。提交后可回到统一登录页等待审核结果。
            </p>
            <div>
              <Button asChild variant="link" className="px-0">
                <Link href="/admin/login?role=agent">返回代理登录</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <AgentRegisterForm action={agentRegisterAction} />
      </div>
    </main>
  );
}
