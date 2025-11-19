
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSitemap } from "@/lib/builder/sitemap-generator";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const { subdomain } = params;

    const project = await prisma.project.findFirst({
      where: { subdomain },
      select: { 
        subdomain: true, 
        customDomain: true,
        pages: true,
        navigationConfig: true,
      },
    });

    if (!project || !project.subdomain) {
      return new NextResponse("Website not found", { status: 404 });
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
      return !page.hidden; // Fallback to page-level hidden flag
    });

    const baseUrl = project.customDomain 
      ? `https://${project.customDomain}`
      : undefined;
    
    const sitemapXml = generateSitemap(
      project.subdomain, 
      visiblePages,
      baseUrl
    );

    return new NextResponse(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Sitemap error:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
