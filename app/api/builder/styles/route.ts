
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
export const runtime = 'edge';


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
      select: { globalStyles: true, siteConfig: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const siteConfig = project.siteConfig ? JSON.parse(project.siteConfig) : {};
    const globalStyles = project.globalStyles 
      ? JSON.parse(project.globalStyles)
      : {
          colors: siteConfig.colors || {
            primary: "#1E3A8A",
            secondary: "#3B82F6",
            accent: "#F59E0B",
            background: "#FFFFFF",
            text: "#1F2937",
          },
          fonts: {
            heading: "Inter",
            body: "Inter",
          },
          borderRadius: "8px",
          spacing: "normal",
        };

    return NextResponse.json({ 
      success: true,
      globalStyles 
    });
  } catch (error) {
    console.error("Styles get error:", error);
    return NextResponse.json(
      { error: "Failed to get styles" },
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
      select: { userId: true, siteConfig: true },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update global styles and also update siteConfig colors for backward compatibility
    const siteConfig = project.siteConfig ? JSON.parse(project.siteConfig) : {};
    siteConfig.colors = globalStyles.colors;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        globalStyles: JSON.stringify(globalStyles),
        siteConfig: JSON.stringify(siteConfig),
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Styles updated successfully" 
    });
  } catch (error) {
    console.error("Styles update error:", error);
    return NextResponse.json(
      { error: "Failed to update styles" },
      { status: 500 }
    );
  }
}
