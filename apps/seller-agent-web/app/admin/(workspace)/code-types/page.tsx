import { toggleCodeTypeStatus, upsertCodeType } from "@/app/admin/actions";
import { getDashboardData } from "@/lib/dashboard-data";
import {
  Badge,
  CheckboxInput,
  GhostButton,
  PrimaryButton,
  SectionHeader,
  TextArea,
  TextInput,
} from "@/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminCodeTypesPage() {
  const dashboard = await getDashboardData();

  return (
    <main className="grid gap-5 py-1">
      <SectionHeader
        eyebrow="卡密类型"
        title="定义发码类型与默认模板。"
        description="每个类型拥有自己的库存与默认文案，后续还可以按代理继续覆盖。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
        <form action={upsertCodeType} className="panel grid gap-3">
          <div className="section-label">新建类型</div>
          <TextInput name="name" label="名称" placeholder="月卡" />
          <TextInput
            name="slug"
            label="标识"
            placeholder="monthly-card"
            help="留空时会根据名称自动生成。"
          />
          <TextInput
            name="description"
            label="说明"
            placeholder="标准月卡兑换码"
          />
          <TextArea
            name="defaultTemplate"
            label="默认模板"
            placeholder="兑换码：{code}"
            rows={5}
          />
          <CheckboxInput name="isActive" label="创建后立即启用" defaultChecked />
          <PrimaryButton>创建类型</PrimaryButton>
        </form>

        <div className="grid gap-3">
          {dashboard.codeTypes.map((codeType) => (
            <Card key={codeType.id} className="panel p-0">
              <CardContent className="grid gap-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{codeType.name}</h3>
                    <p className="mt-1 text-sm text-zinc-500">标识：{codeType.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{codeType.isActive ? "启用" : "停用"}</Badge>
                    <Badge tone="muted">{codeType._count.codes} 个卡密</Badge>
                  </div>
                </div>

                <form action={upsertCodeType} className="grid gap-3">
                  <input type="hidden" name="id" value={codeType.id} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <TextInput name="name" label="名称" defaultValue={codeType.name} />
                    <TextInput name="slug" label="标识" defaultValue={codeType.slug} />
                  </div>
                  <TextInput
                    name="description"
                    label="说明"
                    defaultValue={codeType.description ?? ""}
                  />
                  <TextArea
                    name="defaultTemplate"
                    label="默认模板"
                    rows={4}
                    defaultValue={codeType.defaultTemplate}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <CheckboxInput
                      name="isActive"
                      label="启用状态"
                      defaultChecked={codeType.isActive}
                    />
                    <PrimaryButton>保存类型</PrimaryButton>
                  </div>
                </form>

                <form action={toggleCodeTypeStatus} className="flex">
                  <input type="hidden" name="id" value={codeType.id} />
                  <input type="hidden" name="current" value={String(codeType.isActive)} />
                  <GhostButton>
                    {codeType.isActive ? "暂停类型" : "重新启用"}
                  </GhostButton>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
