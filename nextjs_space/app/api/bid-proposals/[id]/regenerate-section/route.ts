
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateSectionContent } from "@/lib/bid-ai-generator";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { section } = await req.json();

    // Validate section name
    const validSections = [
      "envelope1Content",
      "envelope2Content",
      "envelope1Notes",
      "envelope2Notes",
      "generalProposalComment",
    ];

    if (!validSections.includes(section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    // Get the current bid proposal
    const bid = await prisma.bidProposal.findUnique({
      where: { id: params.id },
    });

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Generate new content for the section
    const newContent = await generateSectionContent(bid, section);

    // Update the section
    const updated = await prisma.bidProposal.update({
      where: { id: params.id },
      data: {
        [section]: newContent,
        lastEditedById: session.user.id,
        lastEditedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true,
      content: newContent,
      updatedAt: updated.updatedAt 
    });
  } catch (error) {
    console.error("Error regenerating section:", error);
    return NextResponse.json(
      { error: "Failed to regenerate section" },
      { status: 500 }
    );
  }
}
