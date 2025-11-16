
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AgentBuilder } from "@/components/agents/agent-builder";

export const metadata = {
  title: "Create AI Agent | CDM Suite",
  description: "Build a new AI agent",
};

export default async function NewAgentPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }

  return <AgentBuilder user={session.user} />;
}
