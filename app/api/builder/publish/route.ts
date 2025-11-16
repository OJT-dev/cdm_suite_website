
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
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing project ID" },
        { status: 400 }
      );
    }

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

    // Update project status to active
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "active",
        publishedAt: new Date(),
        launchedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      project: updatedProject,
      url: `https://${project.subdomain}.cdmsuite.com`,
    });
  } catch (error) {
    console.error("Project publish error:", error);
    return NextResponse.json(
      { error: "Failed to publish project" },
      { status: 500 }
    );
  }
}
