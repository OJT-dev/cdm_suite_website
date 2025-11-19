
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const runtime = 'edge';


// GET /api/crm/sequences/assignments - List all sequence assignments
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sequenceId = searchParams.get('sequenceId');
    const leadId = searchParams.get('leadId');

    const where: any = {};
    if (status) where.status = status;
    if (sequenceId) where.sequenceId = sequenceId;
    if (leadId) where.leadId = leadId;

    const assignments = await prisma.sequenceAssignment.findMany({
      where,
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
            status: true,
          },
        },
        activities: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST /api/crm/sequences/assignments - Assign a sequence to leads
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, employeeProfile: true },
    });

    if (user?.role !== 'admin' && !user?.employeeProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { sequenceId, leadIds, autoStart } = data;

    if (!sequenceId || !leadIds || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if sequence is approved
    const sequence = await prisma.sequence.findUnique({
      where: { id: sequenceId },
      select: { status: true },
    });

    if (!sequence) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
    }

    if (sequence.status !== 'approved' && sequence.status !== 'active') {
      return NextResponse.json(
        { error: 'Sequence must be approved before assignment' },
        { status: 400 }
      );
    }

    // Create assignments
    const assignments = await Promise.all(
      leadIds.map(async (leadId: string) => {
        // Check if assignment already exists
        const existing = await prisma.sequenceAssignment.findFirst({
          where: {
            sequenceId,
            leadId,
            status: { in: ['pending', 'active'] },
          },
        });

        if (existing) {
          return null; // Skip duplicate
        }

        return prisma.sequenceAssignment.create({
          data: {
            sequenceId,
            leadId,
            assignedBy: user.id,
            assignedById: user.id,
            status: autoStart ? 'active' : 'pending',
            startedAt: autoStart ? new Date() : null,
          },
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
          },
        });
      })
    );

    const createdAssignments = assignments.filter((a) => a !== null);

    // Update sequence usage count
    await prisma.sequence.update({
      where: { id: sequenceId },
      data: {
        timesUsed: { increment: createdAssignments.length },
      },
    });

    return NextResponse.json({
      assignments: createdAssignments,
      message: `Assigned sequence to ${createdAssignments.length} lead(s)`,
    });
  } catch (error) {
    console.error('Error creating assignments:', error);
    return NextResponse.json(
      { error: 'Failed to create assignments' },
      { status: 500 }
    );
  }
}

