
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateProposalTitle } from '@/lib/bid-ai-generator';
export const runtime = 'edge';


// POST /api/bid-proposals/[id]/regenerate-title - Regenerate proposal title
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bidProposal = await prisma.bidProposal.findUnique({
      where: { id: params.id },
    });

    if (!bidProposal) {
      return NextResponse.json({ error: 'Bid proposal not found' }, { status: 404 });
    }

    const proposalTitle = await generateProposalTitle(bidProposal);

    const updatedProposal = await prisma.bidProposal.update({
      where: { id: params.id },
      data: {
        proposalTitle,
        lastEditedById: session.user.id,
        lastEditedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true,
      proposalTitle: updatedProposal.proposalTitle 
    });
  } catch (error: any) {
    console.error('Error regenerating proposal title:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate title', details: error.message },
      { status: 500 }
    );
  }
}
