
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, pageSlug, sectionType, currentContent } = body;

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Build AI prompt for section regeneration
    const businessData = project.businessData ? JSON.parse(project.businessData) : {};
    
    const prompt = `Regenerate improved content for a ${sectionType} section on a ${pageSlug} page.

Business Context:
- Business: ${businessData.businessName || 'Unknown'}
- Industry: ${businessData.industry || 'Unknown'}
- Services: ${businessData.services?.join(', ') || 'Unknown'}

Current Content:
${JSON.stringify(currentContent, null, 2)}

Generate improved, more engaging content for this section. Respond with JSON only in this format:
{
  "title": "Improved section title",
  "content": "Improved section content with better copy",
  "items": [
    {
      "title": "Item title",
      "description": "Item description",
      "icon": "lucide-icon-name"
    }
  ]
}`;

    // Call AI API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert website content writer. Create engaging, conversion-focused content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const aiData = await response.json();
    const content = JSON.parse(aiData.choices[0].message.content);

    return NextResponse.json(content);
  } catch (error) {
    console.error("Section regeneration error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate section" },
      { status: 500 }
    );
  }
}
