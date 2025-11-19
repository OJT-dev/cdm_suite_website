
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
export const runtime = 'edge';


export const dynamic = 'force-dynamic';

// GET /api/agents/[agentId] - Get single agent
export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[agentId] - Update agent
export async function PATCH(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma.aIAgent.findUnique({
      where: { id: params.agentId },
    });

    if (!agent || agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const body = await request.json();
    
    const updatedAgent = await prisma.aIAgent.update({
      where: { id: params.agentId },
      data: {
        name: body.name,
        description: body.description,
        personality: body.personality,
        tone: body.tone,
        welcomeMessage: body.welcomeMessage,
        widgetColor: body.widgetColor,
        widgetPosition: body.widgetPosition,
        status: body.status,
        isPublic: body.isPublic,
      },
    });

    return NextResponse.json({ agent: updatedAgent });
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[agentId] - Delete agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only the master user (fray@cdmsuite.com) can delete agents
    if (session.user.email !== 'fray@cdmsuite.com') {
      return NextResponse.json({ error: 'Only the master user can delete agents' }, { status: 403 });
    }

    const agent = await prisma.aIAgent.findUnique({
      where: { id: params.agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    await prisma.aIAgent.delete({
      where: { id: params.agentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
