
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AgentEditor } from "@/components/agents/agent-editor";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Edit AI Agent | CDM Suite",
  description: "Edit and manage your AI agent",
};

export default async function AgentEditorPage({ params }: { params: { agentId: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }

  const agent = await prisma.aIAgent.findUnique({
    where: { id: params.agentId },
    include: {
      knowledgeSources: true,
      integrationConfigs: true,
      workflowRules: true,
    },
  });

  if (!agent || agent.userId !== session.user.id) {
    redirect("/dashboard/ai-agents");
  }

  return <AgentEditor agent={agent} user={session.user} />;
}
