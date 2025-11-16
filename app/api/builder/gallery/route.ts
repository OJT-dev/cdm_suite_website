
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// POST /api/builder/gallery - Auto-add website to gallery after generation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    // Get project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if already in gallery
    const existing = await prisma.websiteGallery.findUnique({
      where: { projectId },
    });

    if (existing) {
      return NextResponse.json({ gallery: existing });
    }

    // Parse project data
    const businessData = project.businessData ? JSON.parse(project.businessData) : {};
    const pages = project.pages ? JSON.parse(project.pages) : [];

    // Auto-generate gallery entry
    const galleryEntry = await prisma.websiteGallery.create({
      data: {
        projectId,
        title: project.name,
        description: businessData.description || `A ${project.template} website`,
        thumbnail: businessData.thumbnail || "/images/placeholder-website.jpg",
        category: project.template || "business",
        industry: businessData.industry || null,
        tags: businessData.services || [],
        highlightedFeatures: extractFeatures(pages),
        liveUrl: project.subdomain ? `https://${project.subdomain}.cdmsuite.com` : null,
        status: "pending", // Requires approval before showing publicly
        isPublic: false,
      },
    });

    return NextResponse.json({ gallery: galleryEntry });
  } catch (error) {
    console.error("Error adding to gallery:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to extract features from pages
function extractFeatures(pages: any[]): string[] {
  const features: string[] = [];
  
  if (pages.some(p => p.slug === "contact")) {
    features.push("Contact Form");
  }
  if (pages.some(p => p.slug === "blog")) {
    features.push("Blog");
  }
  if (pages.some(p => p.slug === "services")) {
    features.push("Services");
  }
  if (pages.some(p => p.slug === "about")) {
    features.push("About Us");
  }
  
  return features.slice(0, 5); // Max 5 features
}
