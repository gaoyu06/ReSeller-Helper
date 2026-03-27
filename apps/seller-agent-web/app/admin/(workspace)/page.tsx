import Link from "next/link";
import {
  Boxes,
  FileCode2,
  KeyRound,
  PackageCheck,
  ScrollText,
  Sparkles,
  Users2,
} from "lucide-react";
import { format } from "date-fns";
import { getDashboardData } from "@/lib/dashboard-data";
import { Badge, SectionHeader, StatTile } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const shortcuts = [
  {
    href: "/admin/code-types",
    label: "卡密类型",
    description: "管理类型信息、默认模板与启用状态。",
    icon: <FileCode2 className="h-4 w-4" />,
  },
  {
    href: "/admin/inventory",
    label: "库存管理",
    description: "导入卡密、检查批次与调整库存状态。",
    icon: <PackageCheck className="h-4 w-4" />,
  },
  {
    href: "/admin/agents",
    label: "代理账号",
    description: "维护账号、额度、权限与密码重置。",
    icon: <Users2 className="h-4 w-4" />,
  },
  {
    href: "/admin/templates",
    label: "模板配置",
    description: "按代理和类型覆盖发码文案。",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    href: "/admin/security",
    label: "安全中心",
    description: "修改管理员密码并刷新当前会话。",
    icon: <KeyRound className="h-4 w-4" />,
  },
];

export default async function AdminOverviewPage() {
  const dashboard = await getDashboardData();

  return (
    <main className="grid gap-5 py-1">
      <SectionHeader
        eyebrow="后台总览"
        title="在一个后台里管理完整发码链路。"
        description="现在的后台按页面拆分，信息更集中，避免所有能力挤在一个超长页面里。"
      />

      <section className="grid gap-3 lg:grid-cols-4">
        <StatTile label="今日发码" value={dashboard.stats.todayIssued} icon={<PackageCheck className="h-4 w-4" />} />
        <StatTile label="本月发码" value={dashboard.stats.monthIssued} icon={<ScrollText className="h-4 w-4" />} />
        <StatTile label="可用库存" value={dashboard.stats.unusedCodes} icon={<Boxes className="h-4 w-4" />} />
        <StatTile label="代理数量" value={dashboard.agents.length} icon={<Users2 className="h-4 w-4" />} />
      </section>

      <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map((item) => (
          <Card key={item.href} className="transition hover:border-amber-300/20 hover:bg-[#171922]">
            <CardContent className="p-5">
              <Link href={item.href} className="block">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-200">
                  {item.icon}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">{item.label}</h2>
                <p className="mt-1.5 text-sm leading-6 text-zinc-400">{item.description}</p>
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="panel overflow-x-auto">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-[0.08em] text-zinc-500">最近发码</p>
              <h2 className="mt-1.5 text-xl font-semibold text-white">最新使用记录</h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/usage">查看日志</Link>
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>代理</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>卡密</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.usageLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-zinc-500">
                    {format(log.createdAt, "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="text-white">{log.agent.name}</TableCell>
                  <TableCell className="text-zinc-300">{log.codeType.name}</TableCell>
                  <TableCell className="font-mono text-xs text-zinc-200">
                    {log.code.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="panel">
          <p className="text-[11px] tracking-[0.08em] text-zinc-500">已启用模板</p>
          <div className="mt-3 grid gap-2.5">
            {dashboard.templates.map((template) => (
              <Card key={template.id} className="rounded-xl border-white/6 bg-black/20">
                <CardContent className="px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">
                      {template.agent.name} → {template.codeType.name}
                    </div>
                    <Badge>{template.enabled ? "启用" : "停用"}</Badge>
                  </div>
                  <div className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-sm text-zinc-500">
                    {template.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
