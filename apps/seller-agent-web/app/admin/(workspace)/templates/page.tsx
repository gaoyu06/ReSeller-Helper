import { AgentReviewStatus } from "@prisma/client";
import { deleteTemplate, upsertTemplate } from "@/app/admin/actions";
import { getDashboardData } from "@/lib/dashboard-data";
import {
  CheckboxInput,
  EmptyState,
  GhostButton,
  PrimaryButton,
  SectionHeader,
  SelectInput,
  TextArea,
} from "@/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminTemplatesPage() {
  const dashboard = await getDashboardData();
  const approvedAgents = dashboard.agents.filter(
    (agent) => agent.reviewStatus === AgentReviewStatus.APPROVED,
  );

  return (
    <main className="grid gap-5 py-1">
      <SectionHeader
        eyebrow="模板配置"
        title="按代理与类型覆盖发码文案。"
        description="启用覆盖模板后会优先使用覆盖内容；否则系统回退到类型默认模板。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <form action={upsertTemplate} className="panel grid gap-3">
          <div className="section-label">创建或更新模板</div>
          <SelectInput name="agentId" label="代理账号">
            {approvedAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </SelectInput>
          <SelectInput name="codeTypeId" label="卡密类型">
            {dashboard.codeTypes.map((codeType) => (
              <option key={codeType.id} value={codeType.id}>
                {codeType.name}
              </option>
            ))}
          </SelectInput>
          <TextArea
            name="content"
            label="模板内容"
            rows={8}
            placeholder={"您的兑换码如下：\n{code}"}
          />
          <CheckboxInput name="enabled" label="保存后立即启用" defaultChecked />
          <PrimaryButton>保存模板</PrimaryButton>
        </form>

        <div className="grid gap-3">
          {dashboard.templates.length ? (
            dashboard.templates.map((template) => (
              <Card key={template.id} className="panel p-0">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">
                        {template.agent.name} → {template.codeType.name}
                      </div>
                      <div className="mt-1 text-[11px] tracking-[0.08em] text-zinc-500">
                        {template.enabled ? "已启用" : "已停用"}
                      </div>
                    </div>
                    <form action={deleteTemplate}>
                      <input type="hidden" name="id" value={template.id} />
                      <GhostButton>删除</GhostButton>
                    </form>
                  </div>
                  <pre className="mt-3 overflow-auto rounded-xl border border-white/6 bg-black/20 p-3 text-sm text-zinc-200 whitespace-pre-wrap">
                    {template.content}
                  </pre>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              title="还没有覆盖模板"
              description="先创建一个按代理生效的模板，用来覆盖卡密类型的默认文案。"
            />
          )}
        </div>
      </div>
    </main>
  );
}
