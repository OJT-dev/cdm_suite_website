
/**
 * Script to generate titles and ensure all bid proposals are properly updated
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

import { PrismaClient } from '@prisma/client';
import { generateProposalTitle } from '../lib/bid-ai-generator';

const prisma = new PrismaClient();

async function updateAllBidTitles() {
  try {
    console.log('🔍 Fetching all bid proposals...');
    
    const allBids = await prisma.bidProposal.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${allBids.length} bid proposals`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const bid of allBids) {
      try {
        console.log(`\n📝 Processing: ${bid.title || bid.solicitationNumber}`);
        
        // Check if title is missing or generic
        const needsTitle = !bid.proposalTitle || 
                          bid.proposalTitle.trim() === '' ||
                          bid.proposalTitle === bid.title;
        
        if (needsTitle) {
          console.log('  ⚡ Generating proposal title...');
          
          // Generate title based on RFP details
          const context = {
            title: bid.title,
            description: bid.description || '',
            solicitationNumber: bid.solicitationNumber,
            issuingOrg: bid.issuingOrg || '',
            solicitationType: bid.solicitationType || ''
          };
          
          const proposalTitle = await generateProposalTitle(context);
          
          // Update database
          await prisma.bidProposal.update({
            where: { id: bid.id },
            data: {
              proposalTitle,
              lastEditedAt: new Date()
            }
          });
          
          console.log(`  ✅ Updated title: "${proposalTitle}"`);
          updatedCount++;
        } else {
          console.log(`  ⏭️  Already has title: "${bid.proposalTitle}"`);
          skippedCount++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`  ❌ Error processing bid ${bid.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`  ✅ Updated: ${updatedCount}`);
    console.log(`  ⏭️  Skipped: ${skippedCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log(`  📝 Total: ${allBids.length}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateAllBidTitles()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
