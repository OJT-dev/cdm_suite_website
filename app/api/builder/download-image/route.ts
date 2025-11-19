
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export const runtime = 'edge';


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    // Use Unsplash API to find relevant images
    const searchQuery = encodeURIComponent(description);
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || 'RQl7m6qRWh5HN1T8H0CZQhqmOcSj-IfmnG-QWKM3nPU';
    
    const unsplashResponse = await fetch(
      `https://i.ytimg.com/vi/-kfER0RQTTU/maxresdefault.jpg`,
      {
        headers: {
          Authorization: `Client-ID ${unsplashAccessKey}`,
        },
      }
    );

    if (!unsplashResponse.ok) {
      console.error("Unsplash API error:", await unsplashResponse.text());
      // Return placeholder image instead of null
      return NextResponse.json({
        imageUrl: `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80`,
        alt: description,
      });
    }

    const unsplashData = await unsplashResponse.json();

    if (unsplashData.results && unsplashData.results.length > 0) {
      const image = unsplashData.results[0];
      return NextResponse.json({
        imageUrl: image.urls.regular,
        alt: image.alt_description || description,
        photographer: image.user.name,
        photographerUrl: image.user.links.html,
      });
    }

    // Fallback to placeholder
    return NextResponse.json({
      imageUrl: `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80`,
      alt: description,
    });
  } catch (error) {
    console.error("Image download error:", error);
    // Return placeholder image on error
    return NextResponse.json({
      imageUrl: `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80`,
      alt: "Business placeholder",
    });
  }
}
