
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const runtime = 'edge';


// PATCH /api/crm/sequences/assignments/[id] - Update assignment status
export async function PATCH(
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
      select: { role: true, employeeProfile: true },
    });

    if (user?.role !== 'admin' && !user?.employeeProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { status, notes } = data;

    // Get current assignment first
    const assignment = await prisma.sequenceAssignment.findUnique({
      where: { id: params.id },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      
      if (status === 'active' && !assignment.startedAt) {
        updateData.startedAt = new Date();
      } else if (status === 'paused') {
        updateData.pausedAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updated = await prisma.sequenceAssignment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        sequence: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        activities: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    // Log activity
    await prisma.sequenceActivity.create({
      data: {
        assignmentId: params.id,
        stepOrder: assignment.currentStep,
        actionType: `sequence_${status}`,
        result: JSON.stringify({ previousStatus: assignment.status, newStatus: status }),
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ assignment: updated });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}

