import {
  approveAgentApplication,
  grantPermission,
  rejectAgentApplication,
  revokePermission,
  toggleAgentStatus,
  upsertAgent,
} from "@/app/admin/actions";
import { AgentReviewStatus } from "@prisma/client";
import { getDashboardData } from "@/lib/dashboard-data";
import {
  Badge,
  CheckboxInput,
  GhostButton,
  NumberInput,
  PrimaryButton,
  SectionHeader,
  SelectInput,
  TextInput,
} from "@/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminAgentsPage() {
  const dashboard = await getDashboardData();
  const approvedAgents = dashboard.agents.filter(
    (agent) => agent.reviewStatus === AgentReviewStatus.APPROVED,
  );

  return (
    <main className="grid gap-5 py-1">
      <SectionHeader
        eyebrow="代理账号"
        title="创建代理、调整额度并分配权限。"
        description="代理账号已改为密码登录与会话机制。现在还支持前台注册申请，管理员审核后再配置额度与启用状态。"
      />

      {dashboard.pendingAgents.length ? (
        <section className="grid gap-4">
          <div>
            <div className="section-label">待审核申请</div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              当前有 {dashboard.pendingAgents.length} 个代理申请等待处理
            </h2>
          </div>

          <div className="grid gap-4">
            {dashboard.pendingAgents.map((agent) => (
              <Card key={agent.id} className="panel p-0 border-sky-400/12 bg-[#121722]/88">
                <CardContent className="grid gap-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                      <p className="mt-1 text-sm text-zinc-400">@{agent.username}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="muted">待审核</Badge>
                      <Badge tone="muted">
                        {agent.createdAt.toLocaleDateString("zh-CN")} 提交
                      </Badge>
                    </div>
                  </div>

                  {agent.applicationNote ? (
                    <Card className="rounded-xl border-white/6 bg-black/20 shadow-none">
                      <CardContent className="px-3.5 py-3">
                        <div className="text-[11px] tracking-[0.08em] text-zinc-500">申请说明</div>
                        <div className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                          {agent.applicationNote}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  <div className="grid gap-4 lg:grid-cols-2">
                    <form action={approveAgentApplication} className="grid gap-3 rounded-2xl border border-emerald-400/12 bg-emerald-500/6 p-4">
                      <input type="hidden" name="id" value={agent.id} />
                      <div className="text-sm font-medium text-emerald-100">审核通过并配置账号</div>
                      <TextInput name="name" label="显示名称" defaultValue={agent.name} />
                      <div className="grid gap-3 md:grid-cols-3">
                        <NumberInput name="dailyLimit" label="日额度" defaultValue={5} />
                        <NumberInput name="monthlyLimit" label="月额度" defaultValue={60} />
                        <NumberInput name="totalLimit" label="总额度" defaultValue={500} />
                      </div>
                      <TextInput
                        name="reviewNote"
                        label="审核备注"
                        defaultValue={agent.reviewNote ?? ""}
                      />
                      <CheckboxInput name="isActive" label="审核通过后立即启用" defaultChecked />
                      <PrimaryButton>通过申请</PrimaryButton>
                    </form>

                    <form action={rejectAgentApplication} className="grid gap-3 rounded-2xl border border-rose-400/12 bg-rose-500/6 p-4">
                      <input type="hidden" name="id" value={agent.id} />
                      <div className="text-sm font-medium text-rose-100">驳回申请</div>
                      <TextInput
                        name="reviewNote"
                        label="驳回原因"
                        defaultValue={agent.reviewNote ?? ""}
                        help="会在代理登录时直接提示。"
                      />
                      <GhostButton>驳回申请</GhostButton>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <form action={upsertAgent} className="panel grid gap-3">
          <div className="section-label">创建代理</div>
          <TextInput name="name" label="显示名称" placeholder="Alpha Reseller" />
          <TextInput name="username" label="用户名" placeholder="alpha" />
          <TextInput
            name="password"
            type="password"
            label="登录密码"
            placeholder="至少 6 位字符"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <NumberInput name="dailyLimit" label="日额度" defaultValue={5} />
            <NumberInput name="monthlyLimit" label="月额度" defaultValue={60} />
            <NumberInput name="totalLimit" label="总额度" defaultValue={500} />
          </div>
          <CheckboxInput name="isActive" label="创建后立即启用" defaultChecked />
          <PrimaryButton>创建代理</PrimaryButton>
        </form>

        <div className="grid gap-3">
          {dashboard.agents.map((agent) => (
            <Card key={agent.id} className="panel p-0">
              <CardContent className="grid gap-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                    <p className="mt-1 text-sm text-zinc-500">@{agent.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="muted">
                      {agent.reviewStatus === AgentReviewStatus.APPROVED
                        ? "已审核"
                        : agent.reviewStatus === AgentReviewStatus.REJECTED
                          ? "已驳回"
                          : "待审核"}
                    </Badge>
                    <Badge>{agent.isActive ? "启用" : "停用"}</Badge>
                    <Badge tone="muted">{agent.permissions.length} 项权限</Badge>
                    <Badge tone="muted">已发 {agent._count.usageLogs}</Badge>
                  </div>
                </div>

                {agent.reviewNote ? (
                  <Card className="rounded-xl border-white/6 bg-black/20 shadow-none">
                    <CardContent className="px-3.5 py-3">
                      <div className="text-[11px] tracking-[0.08em] text-zinc-500">审核备注</div>
                      <div className="mt-1.5 text-sm leading-6 text-zinc-300">{agent.reviewNote}</div>
                    </CardContent>
                  </Card>
                ) : null}

                <form action={upsertAgent} className="grid gap-3">
                  <input type="hidden" name="id" value={agent.id} />
                  <div className="grid gap-3 md:grid-cols-3">
                    <TextInput name="name" label="名称" defaultValue={agent.name} />
                    <TextInput name="username" label="用户名" defaultValue={agent.username} />
                    <TextInput
                      name="password"
                      type="password"
                      label="重置密码"
                      placeholder="留空表示不修改"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <NumberInput name="dailyLimit" label="日额度" defaultValue={agent.dailyLimit} />
                    <NumberInput name="monthlyLimit" label="月额度" defaultValue={agent.monthlyLimit} />
                    <NumberInput name="totalLimit" label="总额度" defaultValue={agent.totalLimit} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <CheckboxInput
                      name="isActive"
                      label="账号启用"
                      defaultChecked={agent.isActive}
                    />
                    <PrimaryButton>保存代理</PrimaryButton>
                  </div>
                </form>

                <form action={toggleAgentStatus} className="flex">
                  <input type="hidden" name="id" value={agent.id} />
                  <input type="hidden" name="current" value={String(agent.isActive)} />
                  <GhostButton>
                    {agent.isActive ? "停用代理" : "重新启用"}
                  </GhostButton>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <form action={grantPermission} className="panel grid gap-3">
          <div className="section-label">授予权限</div>
          <SelectInput name="agentId" label="代理账号">
            {approvedAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} (@{agent.username})
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
          <PrimaryButton>授予权限</PrimaryButton>
        </form>

        <div className="panel">
          <div className="section-label">当前权限</div>
          <div className="mt-3 grid gap-2.5">
            {dashboard.permissions.map((permission) => (
              <Card
                key={permission.id}
                className="rounded-xl border-white/6 bg-black/20 shadow-none"
              >
                <CardContent className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-3">
                  <div>
                    <div className="font-medium text-white">{permission.agent.name}</div>
                    <div className="text-sm text-zinc-500">{permission.codeType.name}</div>
                  </div>
                  <form action={revokePermission}>
                    <input type="hidden" name="id" value={permission.id} />
                    <GhostButton>撤销</GhostButton>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
