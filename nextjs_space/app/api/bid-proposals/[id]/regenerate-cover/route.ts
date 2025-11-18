
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateCoverPage } from '@/lib/bid-ai-generator';

// POST /api/bid-proposals/[id]/regenerate-cover - Regenerate cover page
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

    const coverPageContent = await generateCoverPage(bidProposal);

    const updatedProposal = await prisma.bidProposal.update({
      where: { id: params.id },
      data: {
        coverPageContent,
        lastEditedById: session.user.id,
        lastEditedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true,
      coverPageContent: updatedProposal.coverPageContent 
    });
  } catch (error: any) {
    console.error('Error regenerating cover page:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate cover page', details: error.message },
      { status: 500 }
    );
  }
}
