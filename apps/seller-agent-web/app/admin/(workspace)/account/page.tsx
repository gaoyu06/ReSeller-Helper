import Link from "next/link";
import { KeyRound, ShieldCheck, User2, Users2 } from "lucide-react";
import { changeAdminPasswordAction } from "@/app/auth/actions";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PasswordChangeForm } from "@/components/password-change-form";
import { Badge, InfoCard, SectionHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminAccountPage() {
  const session = await requireAdminSession();
  const account = await prisma.adminUser.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      isActive: true,
    },
  });

  const totalAgents = await prisma.agent.count();

  return (
    <main className="grid gap-5 py-1">
      <SectionHeader eyebrow="管理员账号" title="管理员账号" />

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <InfoCard
          eyebrow="身份信息"
          title={account.name}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="rounded-[20px] border-[#ddd1c3] bg-[#f8f3eb] shadow-none">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3 text-[#1f1a17]">
                  <User2 className="h-4 w-4 text-[#8f8172]" />
                  <span className="font-medium">用户名</span>
                </div>
                <div className="mt-2 text-sm text-[#5f5347]">@{account.username}</div>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] border-[#ddd1c3] bg-[#f8f3eb] shadow-none">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3 text-[#1f1a17]">
                  <ShieldCheck className="h-4 w-4 text-[#8f8172]" />
                  <span className="font-medium">账号状态</span>
                </div>
                <div className="mt-2">
                  <Badge>{account.isActive ? "启用" : "停用"}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Card className="rounded-[20px] border-[#ddd1c3] bg-[#f8f3eb] shadow-none">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3 text-[#1f1a17]">
                  <Users2 className="h-4 w-4 text-[#8f8172]" />
                  <span className="font-medium">管理代理数</span>
                </div>
                <div className="mt-2 font-display text-3xl text-[#1f1a17]">{totalAgents}</div>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] border-[#ddd1c3] bg-[#f8f3eb] shadow-none">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3 text-[#1f1a17]">
                  <KeyRound className="h-4 w-4 text-[#8f8172]" />
                  <span className="font-medium">会话刷新</span>
                </div>
                <div className="mt-2 text-sm leading-6 text-[#766b5e]">修改密码后生效</div>
              </CardContent>
            </Card>
          </div>
        </InfoCard>

        <InfoCard eyebrow="安全控制" title="密码修改">
          <PasswordChangeForm
            title="修改管理员密码"
            submitLabel="保存新密码"
            action={changeAdminPasswordAction}
          />
        </InfoCard>
      </section>

      <InfoCard eyebrow="快捷入口" title="常用页面">
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="rounded-[22px] border-[#ddd1c3] bg-[#f8f3eb] shadow-none transition hover:border-[#cdbfae] hover:bg-[#f5eee4]">
            <CardContent className="px-4 py-3">
              <div className="font-medium text-[#1f1a17]">代理账号</div>
              <Button asChild variant="link" className="mt-3">
                <Link href="/admin/agents">前往页面</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-[22px] border-[#ddd1c3] bg-[#f8f3eb] shadow-none transition hover:border-[#cdbfae] hover:bg-[#f5eee4]">
            <CardContent className="px-4 py-3">
              <div className="font-medium text-[#1f1a17]">使用日志</div>
              <Button asChild variant="link" className="mt-3">
                <Link href="/admin/usage">前往页面</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-[22px] border-[#ddd1c3] bg-[#f8f3eb] shadow-none transition hover:border-[#cdbfae] hover:bg-[#f5eee4]">
            <CardContent className="px-4 py-3">
              <div className="font-medium text-[#1f1a17]">模板配置</div>
              <Button asChild variant="link" className="mt-3">
                <Link href="/admin/templates">前往页面</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </InfoCard>
    </main>
  );
}
