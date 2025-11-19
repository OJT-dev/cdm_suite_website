
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { envelope, content } = await request.json();

    if (!envelope || (envelope !== 1 && envelope !== 2)) {
      return NextResponse.json(
        { error: 'Invalid envelope number' },
        { status: 400 }
      );
    }

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content must be a string' },
        { status: 400 }
      );
    }

    // Verify ownership
    const bidProposal = await prisma.bidProposal.findUnique({
      where: { id: params.id },
      select: { createdById: true },
    });

    if (!bidProposal || bidProposal.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the content
    const updateData = envelope === 1
      ? { envelope1Content: content }
      : { envelope2Content: content };

    const updated = await prisma.bidProposal.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      bidProposal: updated,
    });
  } catch (error) {
    console.error('Error updating proposal content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}
