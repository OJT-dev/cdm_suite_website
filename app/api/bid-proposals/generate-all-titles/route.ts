
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateProposalTitle } from "@/lib/bid-ai-generator";


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin" && user?.role !== "employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all bids without titles
    const bidsWithoutTitles = await prisma.bidProposal.findMany({
      where: {
        OR: [
          { proposalTitle: null },
          { proposalTitle: "" },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Found ${bidsWithoutTitles.length} bids without titles`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const bid of bidsWithoutTitles) {
      try {
        // Generate title
        const title = await generateProposalTitle({
          title: bid.title,
          description: bid.description || "",
          issuingOrg: bid.issuingOrg || "",
          solicitationType: bid.solicitationType || "",
        });

        // Update bid
        await prisma.bidProposal.update({
          where: { id: bid.id },
          data: {
            proposalTitle: title,
            lastEditedById: session.user.id,
            lastEditedAt: new Date(),
          },
        });

        successCount++;
        results.push({
          id: bid.id,
          solicitationNumber: bid.solicitationNumber,
          title,
          status: "success",
        });

        console.log(`Generated title for bid ${bid.solicitationNumber}: ${title}`);
      } catch (error) {
        errorCount++;
        results.push({
          id: bid.id,
          solicitationNumber: bid.solicitationNumber,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(`Error generating title for bid ${bid.id}:`, error);
      }

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${successCount} titles successfully, ${errorCount} errors`,
      totalProcessed: bidsWithoutTitles.length,
      successCount,
      errorCount,
      results,
    });
  } catch (error) {
    console.error("Error generating all titles:", error);
    return NextResponse.json(
      { error: "Failed to generate titles" },
      { status: 500 }
    );
  }
}
