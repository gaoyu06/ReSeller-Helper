import { deleteAgentTemplate, upsertAgentTemplate } from "@/app/agent/actions";
import { requireAgentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CheckboxInput,
  EmptyState,
  GhostButton,
  HiddenInput,
  PrimaryButton,
  SectionHeader,
  SelectInput,
  TextArea,
} from "@/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";

export default async function AgentTemplatesPage() {
  const session = await requireAgentSession();

  const [permissions, templates] = await Promise.all([
    prisma.agentCodeType.findMany({
      where: {
        agentId: session.user.id,
        codeType: {
          isActive: true,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        codeType: true,
      },
    }),
    prisma.template.findMany({
      where: {
        agentId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        codeType: true,
      },
    }),
  ]);

  return (
    <main className="grid gap-5 py-1">
      <SectionHeader eyebrow="发货模板" title="发货模板" />

      <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
        {permissions.length ? (
          <form action={upsertAgentTemplate} className="panel grid gap-3">
            <div className="section-label">创建或更新模板</div>
            <SelectInput
              name="codeTypeId"
              label="卡密类型"
              options={permissions.map((permission) => ({
                value: permission.codeType.id,
                label: permission.codeType.name,
              }))}
            />
            <TextArea
              name="content"
              label="模板内容"
              rows={8}
              placeholder={"您的兑换码如下：\n{code}"}
            />
            <CheckboxInput name="enabled" label="保存后立即启用" defaultChecked />
            <PrimaryButton>保存模板</PrimaryButton>
          </form>
        ) : (
          <EmptyState title="还没有可配置的卡密类型" />
        )}

        <div className="grid gap-3">
          {templates.length ? (
            templates.map((template) => (
              <Card key={template.id} className="panel p-0">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-[#1f1a17]">{template.codeType.name}</div>
                      <div className="mt-1 text-[11px] tracking-[0.08em] text-[#8f8172]">
                        {template.enabled ? "已启用" : "已停用"}
                      </div>
                    </div>
                    <form action={deleteAgentTemplate}>
                      <HiddenInput name="id" value={template.id} />
                      <GhostButton>删除</GhostButton>
                    </form>
                  </div>
                  <pre className="mt-3 overflow-auto rounded-[18px] border border-[#ddd1c3] bg-[#f8f3eb] p-3 text-sm whitespace-pre-wrap text-[#4f443a]">
                    {template.content}
                  </pre>
                  <details className="mt-3 rounded-[16px] border border-[#e3d7c9] bg-[#fbf7f1] px-3 py-2.5">
                    <summary className="cursor-pointer text-xs text-[#5f5347]">查看默认模板</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-[#74685b]">
                      {template.codeType.defaultTemplate}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState title="还没有模板" />
          )}

          {permissions.length ? (
            <div className="grid gap-3">
              {permissions.map((permission) => {
                const hasTemplate = templates.some(
                  (template) => template.codeTypeId === permission.codeType.id,
                );

                if (hasTemplate) {
                  return null;
                }

                return (
                  <Card key={permission.id} className="panel p-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-[#1f1a17]">{permission.codeType.name}</div>
                        <div className="text-[11px] tracking-[0.08em] text-[#8f8172]">使用默认模板</div>
                      </div>
                      <pre className="mt-3 overflow-auto rounded-[18px] border border-[#ddd1c3] bg-[#f8f3eb] p-3 text-sm whitespace-pre-wrap text-[#4f443a]">
                        {permission.codeType.defaultTemplate}
                      </pre>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
