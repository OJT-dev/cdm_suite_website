
import { prisma } from "@/lib/db";
import { WebsiteGalleryClient } from "@/components/gallery/website-gallery-client";

export const metadata = {
  title: "Website Gallery | CDM Suite",
  description: "Explore websites built with CDM Suite AI Website Builder",
};

export default async function WebsiteGalleryPage() {
  try {
    const websites = await prisma.websiteGallery.findMany({
      where: {
        status: "published",
        isPublic: true,
      },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { views: "desc" },
      ],
      take: 50,
    });

    return <WebsiteGalleryClient websites={websites} />;
  } catch (error) {
    console.error('Error fetching website gallery:', error);
    // During local builds or when the database is unavailable, render an empty gallery
    return <WebsiteGalleryClient websites={[]} />;
  }
}
