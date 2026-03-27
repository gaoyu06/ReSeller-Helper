import { format } from "date-fns";
import { requireAgentSession } from "@/lib/auth";
import { getAgentWorkspace } from "@/lib/agent-data";
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

export default async function AgentHistoryPage() {
  const session = await requireAgentSession();
  const data = await getAgentWorkspace(session.user.id);

  return (
    <main className="grid gap-5 py-1">
      <SectionHeader
        eyebrow="发码记录"
        title="查看最近发出的卡密。"
        description="这份记录会参与额度计算，也是排查问题时最直接的依据。"
      />

      <Card className="panel overflow-x-auto p-0">
        <CardContent className="p-5">
        {data.recentUsage.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>卡密</TableHead>
                <TableHead>输出内容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentUsage.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-zinc-500">
                    {format(log.createdAt, "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="text-zinc-300">{log.codeType.name}</TableCell>
                  <TableCell className="font-mono text-xs text-zinc-200">{log.code.value}</TableCell>
                  <TableCell>
                    <pre className="max-w-xl whitespace-pre-wrap rounded-xl border border-white/6 bg-black/20 p-3 text-xs text-zinc-300">
                      {log.renderedContent}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="还没有发码记录"
            description="完成第一次成功发码后，这里会展示你的最近记录。"
          />
        )}
        </CardContent>
      </Card>
    </main>
  );
}
