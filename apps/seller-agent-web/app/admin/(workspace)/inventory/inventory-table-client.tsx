"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { HiddenInput } from "@/components/admin-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormSelect } from "@/components/ui/form-select";

type InventoryItem = {
  id: string;
  value: string;
  importBatch: string | null;
  status: "UNUSED" | "USED" | "DISABLED";
  codeTypeName: string;
  usedByAgentName: string | null;
};

const statusLabels = {
  UNUSED: "未使用",
  USED: "已使用",
  DISABLED: "已停用",
} as const;

export function InventoryTableClient({
  items,
  updateAction,
  deleteAction,
  batchDeleteAction,
}: {
  items: InventoryItem[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  batchDeleteAction: (formData: FormData) => Promise<void>;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected = useMemo(
    () => items.length > 0 && selectedIds.length === items.length,
    [items.length, selectedIds.length],
  );

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? items.map((item) => item.id) : []);
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id),
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#e2d7ca] bg-[#fbf7f1] px-3 py-2.5">
        <div className="text-sm text-[#5f5347]">
          已选 {selectedIds.length} 项
        </div>
        <form action={batchDeleteAction}>
          {selectedIds.map((id) => (
            <HiddenInput key={id} name="ids" value={id} />
          ))}
          <Button type="submit" variant="danger" size="sm" disabled={selectedIds.length === 0}>
            删除选中
          </Button>
        </form>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={allSelected} onCheckedChange={(value) => toggleAll(value === true)} />
            </TableHead>
            <TableHead>卡密</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>批次</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>使用代理</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((code) => (
            <TableRow key={code.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(code.id)}
                  onCheckedChange={(value) => toggleOne(code.id, value === true)}
                />
              </TableCell>
              <TableCell className="font-mono text-xs text-[#2c251f]">{code.value}</TableCell>
              <TableCell className="text-[#5f5347]">{code.codeTypeName}</TableCell>
              <TableCell className="text-[#8f8172]">{code.importBatch || "—"}</TableCell>
              <TableCell className="text-[#5f5347]">{statusLabels[code.status]}</TableCell>
              <TableCell className="text-[#8f8172]">{code.usedByAgentName || "—"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <form action={updateAction} className="flex flex-wrap gap-2">
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
                    <Button type="submit" variant="ghost" size="sm">
                      更新
                    </Button>
                  </form>
                  <form action={deleteAction}>
                    <HiddenInput name="id" value={code.id} />
                    <Button type="submit" variant="danger" size="sm">
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
  );
}
