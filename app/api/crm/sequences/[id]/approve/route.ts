
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/crm/sequences/[id]/approve - Approve a sequence
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, employeeProfile: true },
    });

    // Only admins or employees with approval capability can approve
    if (user?.role !== 'admin') {
      const employee = user?.employeeProfile;
      if (!employee) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Check capabilities
      const capabilities = JSON.parse(employee.capabilities || '{}');
      if (!capabilities.canApproveSequences) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const data = await request.json();
    const { approved, feedback } = data;

    if (approved) {
      // Approve the sequence
      const sequence = await prisma.sequence.update({
        where: { id: params.id },
        data: {
          status: 'approved',
          approvedById: user.id,
          approvedAt: new Date(),
          activatedAt: new Date(),
        },
        include: {
          steps: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return NextResponse.json({ sequence, message: 'Sequence approved successfully' });
    } else {
      // Reject the sequence
      // First get the current sequence
      const currentSequence = await prisma.sequence.findUnique({
        where: { id: params.id },
        select: { description: true },
      });

      const sequence = await prisma.sequence.update({
        where: { id: params.id },
        data: {
          status: 'pending',
          // Store feedback in description or a separate field
          description: feedback ? `${currentSequence?.description || ''}\n\nFeedback: ${feedback}` : currentSequence?.description,
        },
        include: {
          steps: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return NextResponse.json({ sequence, message: 'Sequence rejected with feedback' });
    }
  } catch (error) {
    console.error('Error approving sequence:', error);
    return NextResponse.json(
      { error: 'Failed to approve sequence' },
      { status: 500 }
    );
  }
}

