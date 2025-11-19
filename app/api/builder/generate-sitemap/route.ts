
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateSitemap, generateRobotsTxt } from "@/lib/builder/sitemap-generator";
export const runtime = 'edge';


export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        userId: true, 
        subdomain: true, 
        customDomain: true,
        pages: true,
        navigationConfig: true,
      },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!project.subdomain) {
      return NextResponse.json(
        { error: "Project must have a subdomain" },
        { status: 400 }
      );
    }

    const pages = project.pages ? JSON.parse(project.pages) : [];
    const navigationConfig = project.navigationConfig 
      ? JSON.parse(project.navigationConfig)
      : null;

    // Filter hidden pages
    const visiblePages = pages.filter((page: any) => {
      if (navigationConfig && navigationConfig.hiddenPages) {
        return !navigationConfig.hiddenPages.includes(page.slug);
      }
      return true;
    });

    // Generate sitemap XML
    const baseUrl = project.customDomain 
      ? `https://${project.customDomain}`
      : undefined;
    
    const sitemapXml = generateSitemap(
      project.subdomain, 
      visiblePages,
      baseUrl
    );

    const robotsTxt = generateRobotsTxt(project.subdomain, baseUrl);

    return NextResponse.json({ 
      success: true,
      sitemap: sitemapXml,
      robots: robotsTxt,
      message: "Sitemap generated successfully" 
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate sitemap" },
      { status: 500 }
    );
  }
}
