
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PATCH /api/bid-proposals/[id]/update-title - Update proposal title
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { proposalTitle } = body;

    if (!proposalTitle || typeof proposalTitle !== 'string') {
      return NextResponse.json(
        { error: 'Invalid title' },
        { status: 400 }
      );
    }

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
    console.error('Error updating proposal title:', error);
    return NextResponse.json(
      { error: 'Failed to update title', details: error.message },
      { status: 500 }
    );
  }
}
