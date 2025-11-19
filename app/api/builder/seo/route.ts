
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// Update SEO settings for a specific page
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, pageSlug, seoData } = await request.json();

    if (!projectId || !pageSlug || !seoData) {
      return NextResponse.json(
        { error: "Project ID, page slug, and SEO data are required" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true, pages: true },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update page SEO data
    const pages = project.pages ? JSON.parse(project.pages) : [];
    const pageIndex = pages.findIndex((p: any) => p.slug === pageSlug);

    if (pageIndex === -1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    pages[pageIndex].seo = {
      ...pages[pageIndex].seo,
      ...seoData,
    };

    // Also update metaTitle and metaDescription for backward compatibility
    if (seoData.metaTitle) pages[pageIndex].metaTitle = seoData.metaTitle;
    if (seoData.metaDescription) pages[pageIndex].metaDescription = seoData.metaDescription;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        pages: JSON.stringify(pages),
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "SEO settings updated successfully" 
    });
  } catch (error) {
    console.error("SEO update error:", error);
    return NextResponse.json(
      { error: "Failed to update SEO settings" },
      { status: 500 }
    );
  }
}
