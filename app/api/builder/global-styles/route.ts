
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// Get global styles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { globalStyles: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const globalStyles = project.globalStyles 
      ? JSON.parse(project.globalStyles)
      : {
          colors: {
            primary: "#3B82F6",
            secondary: "#8B5CF6",
            accent: "#F59E0B",
            text: "#1F2937",
            background: "#FFFFFF",
          },
          fonts: {
            heading: "Inter",
            body: "Inter",
          },
        };

    return NextResponse.json({ 
      success: true,
      globalStyles 
    });
  } catch (error) {
    console.error("Global styles get error:", error);
    return NextResponse.json(
      { error: "Failed to get global styles" },
      { status: 500 }
    );
  }
}

// Update global styles
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, globalStyles } = await request.json();

    if (!projectId || !globalStyles) {
      return NextResponse.json(
        { error: "Project ID and global styles are required" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update global styles
    await prisma.project.update({
      where: { id: projectId },
      data: {
        globalStyles: JSON.stringify(globalStyles),
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Global styles updated successfully" 
    });
  } catch (error) {
    console.error("Global styles update error:", error);
    return NextResponse.json(
      { error: "Failed to update global styles" },
      { status: 500 }
    );
  }
}
