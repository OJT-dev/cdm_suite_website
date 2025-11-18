
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET /api/agents - List all agents for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agents = await prisma.aIAgent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        agentType: true,
        status: true,
        totalConversations: true,
        totalLeadsCaptured: true,
        totalAppointments: true,
        satisfactionRating: true,
        isPublic: true,
        createdAt: true,
      },
    });

    // Calculate stats
    const stats = {
      total: agents.length,
      active: agents.filter((a: any) => a.status === "active").length,
      conversations: agents.reduce((sum: number, a: any) => sum + a.totalConversations, 0),
      leads: agents.reduce((sum: number, a: any) => sum + a.totalLeadsCaptured, 0),
    };

    return NextResponse.json({ agents, stats });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create new agent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, agentType, personality, tone, industry, welcomeMessage, systemPrompt } = body;

    if (!name || !agentType) {
      return NextResponse.json(
        { error: "Name and agent type are required" },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await prisma.aIAgent.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Generate system prompt if not provided
    const finalSystemPrompt = systemPrompt || generateSystemPrompt({
      name,
      agentType,
      personality,
      tone,
      industry,
    });

    // Create agent
    const agent = await prisma.aIAgent.create({
      data: {
        userId: session.user.id,
        name,
        slug,
        description: description || null,
        agentType,
        personality,
        tone,
        industry: industry || null,
        welcomeMessage,
        systemPrompt: finalSystemPrompt,
        status: "draft",
      },
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate system prompt
function generateSystemPrompt(config: any) {
  const { name, agentType, personality, tone, industry } = config;
  
  let prompt = `You are ${name}, an AI assistant`;
  
  if (industry) {
    prompt += ` specializing in the ${industry} industry`;
  }
  
  prompt += `.`;
  
  // Add type-specific instructions
  switch (agentType) {
    case "customer-support":
      prompt += ` Your primary role is to provide excellent customer support by answering questions, resolving issues, and ensuring customer satisfaction.`;
      break;
    case "lead-gen":
      prompt += ` Your primary role is to qualify and capture leads by asking relevant questions, understanding their needs, and collecting their contact information.`;
      break;
    case "appointment-booking":
      prompt += ` Your primary role is to help visitors schedule appointments by understanding their availability and booking suitable time slots.`;
      break;
    case "sales-assistant":
      prompt += ` Your primary role is to assist customers in making purchase decisions by understanding their needs, recommending products, and addressing concerns.`;
      break;
    case "faq-bot":
      prompt += ` Your primary role is to answer frequently asked questions quickly and accurately.`;
      break;
  }
  
  // Add personality and tone
  prompt += ` Your personality is ${personality} and your tone is ${tone}.`;
  
  // Add general guidelines
  prompt += ` Always be helpful, accurate, and respectful. If you don't know something, admit it and offer to connect the visitor with a human representative.`;
  
  return prompt;
}
