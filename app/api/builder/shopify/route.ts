
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
export const runtime = 'edge';


// Save Shopify integration settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, shopifyDomain, accessToken } = await request.json();

    if (!projectId || !shopifyDomain) {
      return NextResponse.json(
        { error: "Project ID and Shopify domain are required" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId as string,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Update project with Shopify integration
    const currentBusinessData = project.businessData ? JSON.parse(project.businessData) : {};
    const updatedProject = await prisma.project.update({
      where: { id: projectId as string },
      data: {
        businessData: JSON.stringify({
          ...currentBusinessData,
          shopify: {
            domain: shopifyDomain,
            accessToken: accessToken, // In production, encrypt this
            connected: true,
            connectedAt: new Date().toISOString(),
          },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Shopify integration connected successfully",
    });
  } catch (error) {
    console.error("Shopify integration error:", error);
    return NextResponse.json(
      { error: "Failed to connect Shopify integration" },
      { status: 500 }
    );
  }
}

// Get Shopify integration status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = request.nextUrl.searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId as string,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const businessData = project.businessData ? JSON.parse(project.businessData) : {};
    const shopifyData = businessData.shopify || {};

    return NextResponse.json({
      connected: !!shopifyData.connected,
      domain: shopifyData.domain || null,
      connectedAt: shopifyData.connectedAt || null,
    });
  } catch (error) {
    console.error("Error fetching Shopify status:", error);
    return NextResponse.json(
      { error: "Failed to fetch Shopify integration status" },
      { status: 500 }
    );
  }
}

// Disconnect Shopify integration
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId as string,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Remove Shopify integration
    const businessData = project.businessData ? JSON.parse(project.businessData) : {};
    delete businessData.shopify;

    await prisma.project.update({
      where: { id: projectId as string },
      data: {
        businessData: JSON.stringify(businessData),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Shopify integration disconnected",
    });
  } catch (error) {
    console.error("Error disconnecting Shopify:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Shopify integration" },
      { status: 500 }
    );
  }
}
