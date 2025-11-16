import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { generateProposalTitle } from '@/lib/bid-ai-generator';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all bids that need title updates
    const bids = await prisma.bidProposal.findMany({
      where: {
        createdById: session.user.id,
      },
    });

    const updates = [];
    const errors = [];

    for (const bid of bids) {
      const currentTitle = bid.proposalTitle || '';
      const isGeneric = !currentTitle || 
                        currentTitle === 'N/A' ||
                        currentTitle.toLowerCase().includes('untitled') ||
                        currentTitle.toLowerCase().includes('processing') ||
                        currentTitle.length < 10;

      if (isGeneric) {
        try {
          // Generate new title
          const newTitle = await generateProposalTitle({
            organizationName: bid.issuingOrg || 'Client Organization',
            rfpTitle: bid.title || '',
            description: bid.description || '',
          });

          // Update in database
          await prisma.bidProposal.update({
            where: { id: bid.id },
            data: { 
              proposalTitle: newTitle,
              lastEditedAt: new Date(),
              lastEditedById: session.user.id,
            },
          });

          updates.push({
            id: bid.id,
            organization: bid.issuingOrg,
            oldTitle: currentTitle || '(none)',
            newTitle,
          });
        } catch (error) {
          console.error(`Failed to update title for ${bid.id}:`, error);
          errors.push({
            id: bid.id,
            organization: bid.issuingOrg,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated: updates.length,
      errorCount: errors.length,
      updates,
      errors,
    });
  } catch (error) {
    console.error('Error in batch title update:', error);
    return NextResponse.json(
      { error: 'Failed to update titles' },
      { status: 500 }
    );
  }
}
