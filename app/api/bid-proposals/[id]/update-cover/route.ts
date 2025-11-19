
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';


// PATCH /api/bid-proposals/[id]/update-cover - Update cover page content
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
    const { coverPageContent } = body;

    if (!coverPageContent || typeof coverPageContent !== 'string') {
      return NextResponse.json(
        { error: 'Invalid cover page content' },
        { status: 400 }
      );
    }

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
    console.error('Error updating cover page:', error);
    return NextResponse.json(
      { error: 'Failed to update cover page', details: error.message },
      { status: 500 }
    );
  }
}
