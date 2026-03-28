import { deleteCodeType, toggleCodeTypeStatus } from "@/app/admin/actions";
import { getDashboardData } from "@/lib/dashboard-data";
import { CodeTypeDialog } from "@/components/admin-dialog-forms";
import { Badge, GhostButton, HiddenInput, SectionHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminCodeTypesPage() {
  const dashboard = await getDashboardData();

  return (
    <main className="grid gap-4 py-1">
      <SectionHeader
        eyebrow="卡密类型"
        title="卡密类型"
      />

      <div className="flex justify-end">
        <CodeTypeDialog triggerLabel="新建类型" />
      </div>

      <div className="grid gap-3">
        {dashboard.codeTypes.map((codeType) => (
          <Card key={codeType.id} className="panel p-0">
            <CardContent className="grid gap-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[#1f1a17]">{codeType.name}</div>
                  <div className="mt-1 text-sm text-[#8f8172]">标识：{codeType.slug}</div>
                  {codeType.description ? (
                    <div className="mt-1 text-sm text-[#5f5347]">{codeType.description}</div>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{codeType.isActive ? "启用" : "停用"}</Badge>
                  <Badge tone="muted">{codeType._count.codes} 个卡密</Badge>
                  <Badge tone="muted">{codeType._count.usageLogs} 条记录</Badge>
                </div>
              </div>

              <div className="rounded-[18px] border border-[#e3d7c9] bg-[#f8f3eb] px-3 py-3 text-sm text-[#5f5347]">
                <div className="text-[11px] tracking-[0.08em] text-[#8f8172] uppercase">默认模板</div>
                <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#1f1a17]">
                  {codeType.defaultTemplate}
                </pre>
              </div>

              <div className="flex flex-wrap gap-2">
                <CodeTypeDialog
                  triggerLabel="编辑"
                  triggerVariant="outline"
                  initialValue={{
                    id: codeType.id,
                    name: codeType.name,
                    slug: codeType.slug,
                    description: codeType.description,
                    defaultTemplate: codeType.defaultTemplate,
                    isActive: codeType.isActive,
                  }}
                />
                <form action={toggleCodeTypeStatus}>
                  <HiddenInput name="id" value={codeType.id} />
                  <HiddenInput name="current" value={String(codeType.isActive)} />
                  <GhostButton>{codeType.isActive ? "暂停类型" : "重新启用"}</GhostButton>
                </form>
                <form action={deleteCodeType}>
                  <HiddenInput name="id" value={codeType.id} />
                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                  >
                    删除类型
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
