
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';


// POST /api/crm/leads/bulk-delete - Delete multiple leads
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only the master user (fray@cdmsuite.com) can delete leads
  if (session.user.email !== 'fray@cdmsuite.com') {
    return NextResponse.json({ error: 'Only the master user can delete leads' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { leadIds } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'No lead IDs provided' }, { status: 400 });
    }

    // Delete all related activities first
    await prisma.leadActivity.deleteMany({
      where: {
        leadId: {
          in: leadIds,
        },
      },
    });

    // Delete all sequence assignments for these leads
    await prisma.sequenceAssignment.deleteMany({
      where: {
        leadId: {
          in: leadIds,
        },
      },
    });

    // Delete the leads
    const result = await prisma.lead.deleteMany({
      where: {
        id: {
          in: leadIds,
        },
      },
    });

    // Note: We could log this to a separate audit log if needed
    // For now, we skip creating a lead activity since the leads are deleted

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Successfully deleted ${result.count} lead${result.count !== 1 ? 's' : ''}`,
    });
  } catch (error) {
    console.error('Error bulk deleting leads:', error);
    return NextResponse.json({ error: 'Failed to delete leads' }, { status: 500 });
  }
}
