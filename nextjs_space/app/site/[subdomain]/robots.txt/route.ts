
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateRobotsTxt } from "@/lib/builder/sitemap-generator";

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
      },
    });

    if (!project || !project.subdomain) {
      return new NextResponse("Website not found", { status: 404 });
    }

    const baseUrl = project.customDomain 
      ? `https://${project.customDomain}`
      : undefined;
    
    const robotsTxt = generateRobotsTxt(project.subdomain, baseUrl);

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Robots.txt error:", error);
    return new NextResponse("Error generating robots.txt", { status: 500 });
  }
}
