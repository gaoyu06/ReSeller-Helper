import { deleteCode, updateCodeStatus } from "@/app/admin/actions";
import { getDashboardData } from "@/lib/dashboard-data";
import { InventoryImportDialog } from "@/components/admin-dialog-forms";
import { Badge, GhostButton, HiddenInput, SectionHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
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
    <main className="grid gap-4 py-1">
      <SectionHeader
        eyebrow="库存管理"
        title="库存管理"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <Badge tone="muted">可用 {dashboard.stats.unusedCodes}</Badge>
          <Badge tone="muted">已使用 {dashboard.stats.usedCodes}</Badge>
          <Badge tone="muted">已停用 {dashboard.stats.disabledCodes}</Badge>
        </div>
        <InventoryImportDialog
          codeTypes={dashboard.codeTypes.map((codeType) => ({
            id: codeType.id,
            name: codeType.name,
          }))}
        />
      </div>

      <div className="panel overflow-x-auto">
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
                <TableCell className="font-mono text-xs text-[#2c251f]">{code.value}</TableCell>
                <TableCell className="text-[#5f5347]">{code.codeType.name}</TableCell>
                <TableCell className="text-[#8f8172]">{code.importBatch || "—"}</TableCell>
                <TableCell>
                  <Badge tone="muted">{statusLabels[code.status]}</Badge>
                </TableCell>
                <TableCell className="text-[#8f8172]">{code.usedByAgent?.name || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <form action={updateCodeStatus} className="flex flex-wrap gap-2">
                      <HiddenInput name="id" value={code.id} />
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
                    <form action={deleteCode}>
                      <HiddenInput name="id" value={code.id} />
                      <Button
                        type="submit"
                        variant="danger"
                        size="sm"
                      >
                        删除
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
