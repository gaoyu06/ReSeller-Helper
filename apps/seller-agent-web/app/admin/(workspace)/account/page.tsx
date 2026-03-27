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
      <SectionHeader
        eyebrow="管理员账号"
        title="把后台访问权限维护得更明确。"
        description="账号、安全与业务操作分开后，后台结构会更清楚，后续扩展也更稳。"
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <InfoCard
          eyebrow="身份信息"
          title={account.name}
          description="该账号负责管理卡密类型、库存、代理权限、模板与运营统计。"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="rounded-xl border-white/8 bg-[#0d0f15] shadow-none">
              <CardContent className="px-3.5 py-3">
                <div className="flex items-center gap-3 text-white">
                  <User2 className="h-4 w-4 text-amber-200" />
                  <span className="font-medium">用户名</span>
                </div>
                <div className="mt-2 text-sm text-zinc-300">@{account.username}</div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-white/8 bg-[#0d0f15] shadow-none">
              <CardContent className="px-3.5 py-3">
                <div className="flex items-center gap-3 text-white">
                  <ShieldCheck className="h-4 w-4 text-amber-200" />
                  <span className="font-medium">账号状态</span>
                </div>
                <div className="mt-2">
                  <Badge>{account.isActive ? "启用" : "停用"}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Card className="rounded-xl border-white/8 bg-[#0d0f15] shadow-none">
              <CardContent className="px-3.5 py-3">
                <div className="flex items-center gap-3 text-white">
                  <Users2 className="h-4 w-4 text-amber-200" />
                  <span className="font-medium">管理代理数</span>
                </div>
                <div className="mt-2 font-display text-3xl text-white">{totalAgents}</div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-white/8 bg-[#0d0f15] shadow-none">
              <CardContent className="px-3.5 py-3">
                <div className="flex items-center gap-3 text-white">
                  <KeyRound className="h-4 w-4 text-amber-200" />
                  <span className="font-medium">会话刷新</span>
                </div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  修改密码后，当前管理员会话会立刻重建。
                </div>
              </CardContent>
            </Card>
          </div>
        </InfoCard>

        <InfoCard
          eyebrow="安全控制"
          title="在一个页面里完成密码轮换"
          description="后台权限与日常业务操作分开，可以减少误操作与认知负担。"
        >
          <PasswordChangeForm
            title="修改管理员密码"
            description="建议定期更换管理员密码，尤其是在账号使用人发生变化时。"
            submitLabel="保存新密码"
            action={changeAdminPasswordAction}
          />
        </InfoCard>
      </section>

      <InfoCard
        eyebrow="快捷入口"
        title="账号维护旁边就是核心运营页面。"
        description="这样既能快速维护后台凭据，也能马上回到代理、日志和模板管理。"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="rounded-[20px] border-white/8 bg-[#0d0f15] shadow-none transition hover:border-amber-300/25 hover:bg-[#11141d]">
            <CardContent className="px-4 py-3">
              <div className="font-medium text-white">代理账号</div>
              <div className="mt-1.5 text-sm leading-6 text-zinc-500">
                创建代理、调整额度并分配权限。
              </div>
              <Button asChild variant="ghost" className="mt-3 px-0 text-amber-200 hover:bg-transparent hover:text-amber-100">
                <Link href="/admin/agents">前往页面</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-[20px] border-white/8 bg-[#0d0f15] shadow-none transition hover:border-amber-300/25 hover:bg-[#11141d]">
            <CardContent className="px-4 py-3">
              <div className="font-medium text-white">使用日志</div>
              <div className="mt-1.5 text-sm leading-6 text-zinc-500">
                审计发码过程，不和账号维护混在一起。
              </div>
              <Button asChild variant="ghost" className="mt-3 px-0 text-amber-200 hover:bg-transparent hover:text-amber-100">
                <Link href="/admin/usage">前往页面</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-[20px] border-white/8 bg-[#0d0f15] shadow-none transition hover:border-amber-300/25 hover:bg-[#11141d]">
            <CardContent className="px-4 py-3">
              <div className="font-medium text-white">模板配置</div>
              <div className="mt-1.5 text-sm leading-6 text-zinc-500">
                维护发码文案，不影响账号生命周期管理。
              </div>
              <Button asChild variant="ghost" className="mt-3 px-0 text-amber-200 hover:bg-transparent hover:text-amber-100">
                <Link href="/admin/templates">前往页面</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </InfoCard>
    </main>
  );
}
