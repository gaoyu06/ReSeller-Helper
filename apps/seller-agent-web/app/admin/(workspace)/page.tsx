import Link from "next/link";
import { format } from "date-fns";
import { getDashboardData } from "@/lib/dashboard-data";
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

export default async function AdminOverviewPage() {
  const dashboard = await getDashboardData();

  return (
    <main className="grid gap-4 py-2">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CompactMetric label="待审核代理" value={dashboard.stats.pendingAgents} />
        <CompactMetric label="今日发码" value={dashboard.stats.todayIssued} />
        <CompactMetric label="可用库存" value={dashboard.stats.unusedCodes} />
        <CompactMetric label="代理数量" value={dashboard.agents.length} />
      </section>

      <Card className="rounded-[28px] border-[#ddd2c4] bg-[rgba(249,245,238,0.94)]">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-lg font-semibold text-[#1f1a17]">最近发码</div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="text-[#f6f1ea]">
                <Link href="/admin/agents">代理管理</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/usage">全部日志</Link>
              </Button>
            </div>
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
                  <TableCell className="text-[#6b5f53]">
                    {format(log.createdAt, "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="text-[#231d19]">{log.agent.name}</TableCell>
                  <TableCell className="text-[#5f5347]">{log.codeType.name}</TableCell>
                  <TableCell className="font-mono text-xs text-[#5f5348]">{log.code.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}

function CompactMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[20px] border border-[#ddd2c4] bg-[#fbf7f1] px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.12em] text-[#6b5f53]">{label}</div>
      <div className="mt-2 font-display text-[1.9rem] leading-none text-[#1f1a17]">{value}</div>
    </div>
  );
}
