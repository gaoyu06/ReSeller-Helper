import { redirect } from "next/navigation";

export default function AgentLoginPage() {
  redirect("/admin/login?role=agent");
}
