
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { improveContent } from "@/lib/builder/content-improver";
export const runtime = 'edge';


export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, action, context } = await request.json();

    if (!content || !action) {
      return NextResponse.json(
        { error: "Content and action are required" },
        { status: 400 }
      );
    }

    const improvedContent = await improveContent({
      content,
      action,
      context,
    });

    return NextResponse.json({ 
      success: true,
      original: content,
      improved: improvedContent 
    });
  } catch (error) {
    console.error("Content improvement error:", error);
    return NextResponse.json(
      { error: "Failed to improve content" },
      { status: 500 }
    );
  }
}
