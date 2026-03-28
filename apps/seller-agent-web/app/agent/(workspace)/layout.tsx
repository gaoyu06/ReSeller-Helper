import Link from "next/link";
import { requireAgentSession } from "@/lib/auth";
import { LogoutForm } from "@/components/logout-form";
import { SideNav } from "@/components/side-nav";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  { href: "/agent", label: "总览" },
  { href: "/agent/history", label: "发码记录" },
  { href: "/agent/security", label: "账号安全" },
];

export default async function AgentWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAgentSession();

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen w-full max-w-[1360px] gap-3 px-3 py-3 lg:grid-cols-[248px_1fr] lg:gap-4 lg:px-6 lg:py-4">
        <Card className="panel h-fit p-0 lg:sticky lg:top-4">
          <CardContent className="p-4">
            <Link href="/" className="block">
              <div className="font-display text-[1.7rem] text-[#1f1a17]">代理工作台</div>
              <div className="mt-1 text-[11px] tracking-[0.08em] text-[#8f8172]">
                {session.user.name} · @{session.user.username}
              </div>
            </Link>

            <div className="mt-5">
              <SideNav title="工作台导航" items={items} />
            </div>

            <div className="mt-5">
              <LogoutForm />
            </div>
          </CardContent>
        </Card>
        <div className="min-w-0 overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
