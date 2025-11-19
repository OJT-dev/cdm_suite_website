
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";


export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { section, content } = await req.json();

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

    // Update the section
    const updated = await prisma.bidProposal.update({
      where: { id: params.id },
      data: {
        [section]: content,
        lastEditedById: session.user.id,
        lastEditedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Section updated successfully",
      updatedAt: updated.updatedAt 
    });
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}
