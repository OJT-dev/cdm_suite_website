
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bidIds } = await request.json();

    if (!Array.isArray(bidIds) || bidIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid bid IDs. Must provide an array of IDs.' },
        { status: 400 }
      );
    }

    // Delete the bid proposals
    const result = await prisma.bidProposal.deleteMany({
      where: {
        id: {
          in: bidIds
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} bid proposal(s)`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error deleting bid proposals:', error);
    return NextResponse.json(
      { error: 'Failed to delete bid proposals' },
      { status: 500 }
    );
  }
}
