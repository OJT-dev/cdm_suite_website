
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// Get navigation configuration
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
      select: { navigationConfig: true, pages: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const pages = project.pages ? JSON.parse(project.pages) : [];
    const navigationConfig = project.navigationConfig 
      ? JSON.parse(project.navigationConfig)
      : {
          pageOrder: pages.map((p: any) => p.slug),
          hiddenPages: [],
          dropdowns: {},
          icons: {},
        };

    return NextResponse.json({ 
      success: true,
      navigationConfig,
      pages 
    });
  } catch (error) {
    console.error("Navigation get error:", error);
    return NextResponse.json(
      { error: "Failed to get navigation" },
      { status: 500 }
    );
  }
}

// Update navigation configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, navigationConfig } = await request.json();

    if (!projectId || !navigationConfig) {
      return NextResponse.json(
        { error: "Project ID and navigation config are required" },
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

    // Update navigation config
    await prisma.project.update({
      where: { id: projectId },
      data: {
        navigationConfig: JSON.stringify(navigationConfig),
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Navigation updated successfully" 
    });
  } catch (error) {
    console.error("Navigation update error:", error);
    return NextResponse.json(
      { error: "Failed to update navigation" },
      { status: 500 }
    );
  }
}
