import { redirect } from "next/navigation";
import { agentRegisterAction } from "@/app/auth/actions";
import { AgentRegisterForm } from "@/app/auth/agent-register-form";
import { getCurrentSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AgentRegisterPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(session.role === "AGENT" ? "/agent" : "/admin");
  }

  return (
    <main className="page-shell mx-auto flex w-full max-w-[560px] flex-1 items-center justify-center px-4 py-8 lg:px-8">
      <div className="grid w-full gap-4">
        <div className="flex justify-start">
          <Button asChild variant="link" className="px-0">
            <Link href="/admin/login?role=agent">返回代理登录</Link>
          </Button>
        </div>
        <AgentRegisterForm action={agentRegisterAction} />
      </div>
    </main>
  );
}
