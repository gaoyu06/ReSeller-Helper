import { requireAgentSession } from "@/lib/auth";
import { getAgentWorkspace } from "@/lib/agent-data";
import { IssueConsole } from "@/app/agent/issue-console";

export default async function AgentIssuePage() {
  const session = await requireAgentSession();
  const data = await getAgentWorkspace(session.user.id);

  return (
    <main className="py-4">
      <IssueConsole
        agentName={data.agent.name}
        codeTypes={data.permissions.map((permission) => ({
          id: permission.codeType.id,
          name: permission.codeType.name,
          description: permission.codeType.description,
        }))}
      />
    </main>
  );
}
