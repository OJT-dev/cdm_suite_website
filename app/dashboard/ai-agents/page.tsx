
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AgentsDashboard } from "@/components/agents/agents-dashboard";

export const metadata = {
  title: "AI Agent Builder | CDM Suite",
  description: "Build and deploy revenue-generating AI agents",
};

export default async function AIAgentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }

  return <AgentsDashboard user={session.user} />;
}
