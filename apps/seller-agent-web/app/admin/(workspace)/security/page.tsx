import { format } from "date-fns";
import { requireAdminSession } from "@/lib/auth";
import { AdminPasswordDialog } from "@/components/admin-dialog-forms";
import { SectionHeader } from "@/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminSecurityPage() {
  const session = await requireAdminSession();

  return (
    <main className="grid gap-4 py-1">
      <SectionHeader
        eyebrow="安全中心"
        title="账号安全"
        description="只保留当前管理员账号信息与密码修改入口。"
      />

      <div className="flex justify-end">
        <AdminPasswordDialog />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="panel p-0">
          <CardContent className="px-4 py-4">
            <div className="text-[11px] tracking-[0.08em] text-[#8f8172]">名称</div>
            <div className="mt-1.5 text-lg font-semibold text-[#1f1a17]">{session.user.name}</div>
          </CardContent>
        </Card>
        <Card className="panel p-0">
          <CardContent className="px-4 py-4">
            <div className="text-[11px] tracking-[0.08em] text-[#8f8172]">用户名</div>
            <div className="mt-1.5 font-mono text-sm text-[#3a3028]">@{session.user.username}</div>
          </CardContent>
        </Card>
        <Card className="panel p-0">
          <CardContent className="px-4 py-4">
            <div className="text-[11px] tracking-[0.08em] text-[#8f8172]">会话到期</div>
            <div className="mt-1.5 text-sm text-[#5f5347]">
              {format(session.expiresAt, "yyyy-MM-dd HH:mm")}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
