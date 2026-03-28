import { AgentReviewStatus } from "@prisma/client";
import { deleteAgent, revokePermission, toggleAgentStatus } from "@/app/admin/actions";
import { getDashboardData } from "@/lib/dashboard-data";
import {
  AgentCreateDialog,
  AgentEditDialog,
  AgentReviewDialog,
  PermissionDialog,
} from "@/components/admin-dialog-forms";
import { Badge, GhostButton, HiddenInput, SectionHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminAgentsPage() {
  const dashboard = await getDashboardData();
  const approvedAgents = dashboard.agents
    .filter((agent) => agent.reviewStatus === AgentReviewStatus.APPROVED)
    .map((agent) => ({
      id: agent.id,
      name: agent.name,
      username: agent.username,
    }));
  const codeTypeOptions = dashboard.codeTypes.map((codeType) => ({
    id: codeType.id,
    name: codeType.name,
  }));

  return (
    <main className="grid gap-4 py-1">
      <SectionHeader
        eyebrow="代理账号"
        title="代理管理"
        description="页面保留代理列表，创建、编辑和审核全部通过弹窗处理。"
      />

      <div className="flex justify-end">
        <AgentCreateDialog />
      </div>

      <div className="grid gap-3">
        {dashboard.agents.map((agent) => (
          <Card key={agent.id} className="rounded-[24px] border-[#ddd2c4] bg-[rgba(249,245,238,0.94)] shadow-none">
            <CardContent className="grid gap-4 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[#1f1a17]">{agent.name}</div>
                  <div className="mt-1 text-sm text-[#6b5f53]">@{agent.username}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="muted">
                    {agent.reviewStatus === AgentReviewStatus.APPROVED
                      ? "已审核"
                      : agent.reviewStatus === AgentReviewStatus.REJECTED
                        ? "已驳回"
                        : "待审核"}
                  </Badge>
                  <Badge>{agent.isActive ? "启用" : "停用"}</Badge>
                  <Badge tone="muted">{agent.permissions.length} 个类型</Badge>
                  <Badge tone="muted">已发 {agent._count.usageLogs}</Badge>
                </div>
              </div>

              {agent.applicationNote ? (
                <div className="rounded-[16px] border border-[#e3d7c9] bg-[#f7f1e8] px-3 py-2 text-xs leading-5 text-[#5f5347]">
                  申请说明：{agent.applicationNote}
                </div>
              ) : null}

              {agent.reviewNote ? (
                <div className="rounded-[16px] border border-[#e3d7c9] bg-[#f7f1e8] px-3 py-2 text-xs leading-5 text-[#5f5347]">
                  审核备注：{agent.reviewNote}
                </div>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {agent.permissions.length ? (
                  agent.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="rounded-[18px] border border-[#e1d6c8] bg-[#f8f3eb] px-3 py-2.5"
                    >
                      <div className="text-xs font-medium text-[#1f1a17]">
                        {permission.codeType.name}
                      </div>
                      <div className="mt-1 text-[11px] text-[#74685b]">
                        日 {permission.dailyLimit} / 月 {permission.monthlyLimit} / 总 {permission.totalLimit}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[18px] border border-dashed border-[#ddd1c3] bg-[#f8f3eb] px-3 py-2.5 text-xs text-[#74685b] sm:col-span-2 xl:col-span-4">
                    尚未配置任何卡密类型额度。
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {agent.reviewStatus === AgentReviewStatus.PENDING ? (
                  <AgentReviewDialog
                    agent={{
                      id: agent.id,
                      name: agent.name,
                      username: agent.username,
                      applicationNote: agent.applicationNote,
                      reviewNote: agent.reviewNote,
                      reviewStatus: agent.reviewStatus,
                    }}
                  />
                ) : null}
                <AgentEditDialog
                  agent={{
                    id: agent.id,
                    name: agent.name,
                    username: agent.username,
                    isActive: agent.isActive,
                  }}
                />
                <form action={toggleAgentStatus}>
                  <HiddenInput name="id" value={agent.id} />
                  <HiddenInput name="current" value={String(agent.isActive)} />
                  <GhostButton>{agent.isActive ? "停用代理" : "重新启用"}</GhostButton>
                </form>
                <form action={deleteAgent}>
                  <HiddenInput name="id" value={agent.id} />
                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                  >
                    删除代理
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="self-start">
          <PermissionDialog
            agents={approvedAgents}
            codeTypes={codeTypeOptions}
            triggerLabel="新增类型额度"
          />
        </div>

        <Card className="rounded-[24px] border-[#ddd2c4] bg-[rgba(249,245,238,0.94)] shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="section-label">当前额度配置</div>
              <Badge tone="muted">{dashboard.permissions.length} 条</Badge>
            </div>

            <div className="mt-3 grid gap-3">
              {dashboard.permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="rounded-[18px] border border-[#e1d6c8] bg-[#f8f3eb] p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-[#1f1a17]">
                        {permission.agent.name}
                      </div>
                      <div className="mt-1 text-xs text-[#74685b]">
                        {permission.codeType.name}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <PermissionDialog
                        agents={approvedAgents}
                        codeTypes={codeTypeOptions}
                        triggerLabel="编辑"
                        triggerVariant="outline"
                        initialValue={{
                          agentId: permission.agentId,
                          codeTypeId: permission.codeTypeId,
                          dailyLimit: permission.dailyLimit,
                          monthlyLimit: permission.monthlyLimit,
                          totalLimit: permission.totalLimit,
                        }}
                      />
                      <form action={revokePermission}>
                        <HiddenInput name="id" value={permission.id} />
                        <GhostButton>撤销</GhostButton>
                      </form>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-[#5f5347]">
                    日额度 {permission.dailyLimit} / 月额度 {permission.monthlyLimit} / 总额度 {permission.totalLimit}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
