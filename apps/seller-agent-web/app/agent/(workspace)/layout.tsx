import Link from "next/link";
import { requireAgentSession } from "@/lib/auth";
import { LogoutForm } from "@/components/logout-form";
import { SideNav } from "@/components/side-nav";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  { href: "/agent", label: "发码" },
  { href: "/agent/templates", label: "模板" },
  { href: "/agent/history", label: "记录" },
  { href: "/agent/security", label: "安全" },
];

export default async function AgentWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAgentSession();

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen w-full max-w-[1360px] gap-3 px-3 py-3 lg:grid-cols-[224px_1fr] lg:gap-4 lg:px-6 lg:py-4">
        <Card className="panel h-fit p-0 lg:sticky lg:top-4">
          <CardContent className="p-3.5">
            <Link href="/agent" className="block">
              <div className="font-display text-[1.45rem] text-[#1f1a17]">代理工作台</div>
              <div className="mt-1 text-[11px] tracking-[0.08em] text-[#8f8172]">
                {session.user.name} · @{session.user.username}
              </div>
            </Link>

            <div className="mt-4">
              <SideNav title="导航" items={items} />
            </div>

            <div className="mt-4">
              <LogoutForm />
            </div>
          </CardContent>
        </Card>
        <div className="min-w-0 overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
