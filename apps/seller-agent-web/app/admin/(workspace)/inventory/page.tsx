import { importCodes, updateCodeStatus } from "@/app/admin/actions";
import { getDashboardData } from "@/lib/dashboard-data";
import {
  Badge,
  GhostButton,
  PrimaryButton,
  SectionHeader,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/admin-ui";
import { FormSelect } from "@/components/ui/form-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusLabels = {
  UNUSED: "未使用",
  USED: "已使用",
  DISABLED: "已停用",
} as const;

export default async function AdminInventoryPage() {
  const dashboard = await getDashboardData();

  return (
    <main className="grid gap-5 py-1">
      <SectionHeader
        eyebrow="库存管理"
        title="导入卡密并检查库存状态。"
        description="按行粘贴卡密即可导入，库存始终归属于某个类型与批次标签。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <form action={importCodes} className="panel grid gap-3">
          <div className="section-label">导入库存</div>
          <SelectInput name="codeTypeId" label="卡密类型">
            {dashboard.codeTypes.map((codeType) => (
              <option key={codeType.id} value={codeType.id}>
                {codeType.name}
              </option>
            ))}
          </SelectInput>
          <TextInput
            name="importBatch"
            label="批次标签"
            placeholder="batch-2026-03-27"
          />
          <TextArea
            name="codes"
            label="卡密内容（每行一个）"
            placeholder={"MONTH-4001\nMONTH-4002\nMONTH-4003"}
            rows={10}
          />
          <PrimaryButton>导入卡密</PrimaryButton>
        </form>

        <div className="panel overflow-x-auto">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="section-label">最近库存</div>
            <div className="flex gap-2">
              <Badge tone="muted">已使用 {dashboard.stats.usedCodes}</Badge>
              <Badge tone="muted">已停用 {dashboard.stats.disabledCodes}</Badge>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>卡密</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>批次</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>使用代理</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.recentCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono text-xs text-zinc-200">{code.value}</TableCell>
                  <TableCell className="text-zinc-300">{code.codeType.name}</TableCell>
                  <TableCell className="text-zinc-500">{code.importBatch || "—"}</TableCell>
                  <TableCell>
                    <Badge tone="muted">{statusLabels[code.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500">{code.usedByAgent?.name || "—"}</TableCell>
                  <TableCell>
                    <form action={updateCodeStatus} className="flex flex-wrap gap-2">
                      <input type="hidden" name="id" value={code.id} />
                      <FormSelect
                        name="status"
                        defaultValue={code.status}
                        options={[
                          { value: "UNUSED", label: "未使用" },
                          { value: "USED", label: "已使用" },
                          { value: "DISABLED", label: "已停用" },
                        ]}
                      />
                      <GhostButton>更新</GhostButton>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
