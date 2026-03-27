import { format } from "date-fns";
import { changeAdminPasswordAction } from "@/app/auth/actions";
import { requireAdminSession } from "@/lib/auth";
import { SectionHeader } from "@/components/admin-ui";
import { PasswordChangeForm } from "@/components/password-change-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminSecurityPage() {
  const session = await requireAdminSession();

  return (
    <main className="grid gap-5 py-1">
      <SectionHeader
        eyebrow="安全中心"
        title="保护管理员账号安全。"
        description="管理员可在独立安全页中修改密码。成功后旧会话会失效，并为当前浏览器签发新会话。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="panel p-0">
          <CardContent className="grid gap-3 p-5">
            <div className="section-label">当前管理员账号</div>
            <Card className="rounded-xl border-white/6 bg-black/20 shadow-none">
              <CardContent className="px-3.5 py-3">
                <div className="text-[11px] tracking-[0.08em] text-zinc-500">名称</div>
                <div className="mt-1.5 text-lg font-semibold text-white">{session.user.name}</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-white/6 bg-black/20 shadow-none">
              <CardContent className="px-3.5 py-3">
                <div className="text-[11px] tracking-[0.08em] text-zinc-500">用户名</div>
                <div className="mt-1.5 font-mono text-sm text-zinc-200">@{session.user.username}</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-white/6 bg-black/20 shadow-none">
              <CardContent className="px-3.5 py-3">
                <div className="text-[11px] tracking-[0.08em] text-zinc-500">会话到期时间</div>
                <div className="mt-1.5 text-sm text-zinc-300">
                  {format(session.expiresAt, "yyyy-MM-dd HH:mm")}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-amber-300/15 bg-amber-300/10 shadow-none">
              <CardContent className="px-3.5 py-3 text-sm leading-6 text-amber-50/85">
                建议只在后台账号维护场景中使用此页面。密码变更后，旧管理员会话会立刻失效。
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <PasswordChangeForm
          title="修改管理员密码"
          description="先输入当前密码确认身份。系统会替换旧管理员会话，避免旧凭证继续可用。"
          submitLabel="保存新密码"
          action={changeAdminPasswordAction}
        />
      </div>
    </main>
  );
}
