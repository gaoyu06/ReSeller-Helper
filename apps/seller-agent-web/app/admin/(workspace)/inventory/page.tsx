import Link from "next/link";
import { CodeStatus, Prisma } from "@prisma/client";
import {
  clearCodesByFilter,
  deleteCode,
  deleteCodesBatch,
  updateCodeStatus,
} from "@/app/admin/actions";
import { InventoryImportDialog } from "@/components/admin-dialog-forms";
import {
  Badge,
  EmptyState,
  HiddenInput,
  SectionHeader,
} from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";
import { InventoryTableClient } from "./inventory-table-client";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  codeTypeId?: string;
  importBatch?: string;
  page?: string;
}>;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const codeTypeId = normalizeFilterValue(params.codeTypeId);
  const importBatch = normalizeFilterValue(params.importBatch);

  const where: Prisma.CodeWhereInput = {
    ...(codeTypeId ? { codeTypeId } : {}),
    ...(importBatch ? { importBatch } : {}),
  };

  const [codeTypes, inventory, totalCount, statsByStatus, batchRows] = await Promise.all([
    prisma.codeType.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.code.findMany({
      where,
      orderBy: {
        importedAt: "desc",
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        codeType: true,
        usedByAgent: true,
      },
    }),
    prisma.code.count({ where }),
    prisma.code.groupBy({
      by: ["status"],
      where,
      _count: {
        _all: true,
      },
    }),
    prisma.code.findMany({
      where: {
        importBatch: {
          not: null,
        },
      },
      distinct: ["importBatch"],
      orderBy: {
        importBatch: "desc",
      },
      select: {
        importBatch: true,
      },
    }),
  ]);

  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
  const stats = statsByStatus.reduce(
    (acc, item) => {
      acc[item.status] = item._count._all;
      return acc;
    },
    {
      [CodeStatus.UNUSED]: 0,
      [CodeStatus.USED]: 0,
      [CodeStatus.DISABLED]: 0,
    } as Record<CodeStatus, number>,
  );

  const batchOptions = batchRows
    .map((item) => item.importBatch)
    .filter((value): value is string => Boolean(value))
    .map((value) => ({ value, label: value }));

  const paginationBase = new URLSearchParams();
  if (codeTypeId) {
    paginationBase.set("codeTypeId", codeTypeId);
  }
  if (importBatch) {
    paginationBase.set("importBatch", importBatch);
  }

  return (
    <main className="grid gap-4 py-1">
      <SectionHeader eyebrow="库存管理" title="库存管理" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge tone="muted">可用 {stats.UNUSED}</Badge>
          <Badge tone="muted">已使用 {stats.USED}</Badge>
          <Badge tone="muted">已停用 {stats.DISABLED}</Badge>
          <Badge tone="muted">共 {totalCount}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={clearCodesByFilter}>
            <HiddenInput name="codeTypeId" value={codeTypeId} />
            <HiddenInput name="importBatch" value={importBatch} />
            <Button type="submit" variant="danger" size="sm" disabled={totalCount === 0}>
              一键清空
            </Button>
          </form>
          <InventoryImportDialog codeTypes={codeTypes} />
        </div>
      </div>

      <Card className="panel p-0">
        <CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
            <div className="grid gap-1.5">
              <Label htmlFor="codeTypeId">套餐</Label>
              <FormSelect
                name="codeTypeId"
                defaultValue={codeTypeId || "all"}
                options={[
                  { value: "all", label: "全部套餐" },
                  ...codeTypes.map((codeType) => ({
                    value: codeType.id,
                    label: codeType.name,
                  })),
                ]}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="importBatch">批次</Label>
              <FormSelect
                name="importBatch"
                defaultValue={importBatch || "all"}
                options={[
                  { value: "all", label: "全部批次" },
                  ...batchOptions,
                ]}
              />
            </div>
            <div className="grid gap-1.5 md:self-end">
              <Button type="submit">筛选</Button>
            </div>
            <div className="grid gap-1.5 md:self-end">
              <Button asChild type="button" variant="outline">
                <Link href="/admin/inventory">重置</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="panel overflow-x-auto">
        {inventory.length ? (
          <InventoryTableClient
            items={inventory.map((code) => ({
              id: code.id,
              value: code.value,
              importBatch: code.importBatch,
              status: code.status,
              codeTypeName: code.codeType.name,
              usedByAgentName: code.usedByAgent?.name ?? null,
            }))}
            updateAction={updateCodeStatus}
            deleteAction={deleteCode}
            batchDeleteAction={deleteCodesBatch}
          />
        ) : (
          <EmptyState title="没有匹配的库存记录" />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[#74685b]">
          第 {page} / {totalPages} 页
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link href={buildPageHref(paginationBase, page - 1)}>上一页</Link>
          </Button>
          <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
            <Link href={buildPageHref(paginationBase, page + 1)}>下一页</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function buildPageHref(base: URLSearchParams, page: number) {
  const params = new URLSearchParams(base);
  params.set("page", String(page));
  return `/admin/inventory?${params.toString()}`;
}

function normalizeFilterValue(value?: string) {
  const normalized = value?.trim();
  if (!normalized || normalized === "all") {
    return "";
  }

  return normalized;
}
