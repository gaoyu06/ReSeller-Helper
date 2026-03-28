import { format } from "date-fns";
import { getDashboardData } from "@/lib/dashboard-data";
import { EmptyState, SectionHeader } from "@/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminUsagePage() {
  const dashboard = await getDashboardData();

  return (
    <main className="grid gap-5 py-1">
      <SectionHeader
        eyebrow="使用日志"
        title="追踪每一次发码记录。"
        description="日志是额度控制、统计与排查问题的核心依据。"
      />

      <Card className="panel overflow-x-auto p-0">
        <CardContent className="p-5">
        {dashboard.usageLogs.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>代理</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>卡密</TableHead>
                <TableHead>输出内容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.usageLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-[#8f8172]">
                    {format(log.createdAt, "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="text-[#1f1a17]">{log.agent.name}</TableCell>
                  <TableCell className="text-[#5f5347]">{log.codeType.name}</TableCell>
                  <TableCell className="font-mono text-xs text-[#2c251f]">{log.code.value}</TableCell>
                  <TableCell>
                    <pre className="max-w-xl whitespace-pre-wrap rounded-[18px] border border-[#ddd1c3] bg-[#f8f3eb] p-3 text-xs text-[#5f5347]">
                      {log.renderedContent}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="还没有发码日志"
            description="代理开始从工作台发码后，这里会自动出现完整记录。"
          />
        )}
        </CardContent>
      </Card>
    </main>
  );
}
