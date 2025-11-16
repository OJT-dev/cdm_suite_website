
import { prisma } from "@/lib/db";
import { AgentGalleryClient } from "@/components/gallery/agent-gallery-client";

export const metadata = {
  title: "AI Agent Gallery | CDM Suite",
  description: "Explore AI agents built with CDM Suite AI Agent Builder",
};

export default async function AgentGalleryPage() {
  try {
    const agents = await prisma.aIAgent.findMany({
      where: {
        isPublic: true,
        status: "active",
      },
      orderBy: [
        { galleryOrder: "asc" },
        { galleryViews: "desc" },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        galleryTitle: true,
        galleryDescription: true,
        galleryThumbnail: true,
        galleryCategory: true,
        galleryTags: true,
        agentType: true,
        totalConversations: true,
        totalLeadsCaptured: true,
        satisfactionRating: true,
      },
      take: 50,
    });

    return <AgentGalleryClient agents={agents} />;
  } catch (error) {
    console.error('Error fetching AI agent gallery:', error);
    // During local builds or when the database is unavailable, render an empty gallery
    return <AgentGalleryClient agents={[]} />;
  }
}
