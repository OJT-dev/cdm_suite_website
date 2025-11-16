import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables from .env file
config();

const prisma = new PrismaClient();

async function generateProposalTitle(bidProposal: any): Promise<string> {
  const context = {
    title: bidProposal.title,
    description: bidProposal.description || "",
    issuingOrg: bidProposal.issuingOrg || "",
    solicitationType: bidProposal.solicitationType || "",
  };

  const prompt = `Generate a professional, concise proposal title for this bid. The title should be clear, specific, and compelling.

Bid Information:
- Original Title: ${context.title}
- Description: ${context.description}
- Issuing Organization: ${context.issuingOrg}
- Solicitation Type: ${context.solicitationType}

Generate only the title (maximum 150 characters), with no additional text or explanation. Make it professional and suitable for a cover page.`;

  try {
    const response = await fetch("https://apis.abacus.ai/chatllm/chat/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { 
            role: "system", 
            content: "You are an expert proposal writer. Generate clear, professional, and compelling proposal titles." 
          },
          { role: "user", content: prompt },
        ],
        model: "gpt-4o-2024-11-20",
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || bidProposal.title;
  } catch (error) {
    console.error("Error generating title:", error);
    // Fallback to original title if generation fails
    return bidProposal.title;
  }
}

async function main() {
  console.log("Starting title generation for all bid proposals...");

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

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < bidsWithoutTitles.length; i++) {
    const bid = bidsWithoutTitles[i];
    
    try {
      console.log(`\n[${i + 1}/${bidsWithoutTitles.length}] Generating title for bid: ${bid.solicitationNumber}`);
      
      // Generate title
      const title = await generateProposalTitle(bid);

      // Update bid
      await prisma.bidProposal.update({
        where: { id: bid.id },
        data: {
          proposalTitle: title,
          lastEditedAt: new Date(),
        },
      });

      successCount++;
      console.log(`✓ Generated: "${title}"`);
    } catch (error) {
      errorCount++;
      console.error(`✗ Error for bid ${bid.solicitationNumber}:`, error);
    }

    // Add delay to avoid rate limiting
    if (i < bidsWithoutTitles.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total processed: ${bidsWithoutTitles.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
