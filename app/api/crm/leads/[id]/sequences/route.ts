
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/crm/leads/[id]/sequences - Get sequence assignments for a lead
export async function GET(
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

    if (user?.role?.toLowerCase() !== 'admin' && !user?.employeeProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const leadId = params.id;

    // Get all sequence assignments for this lead
    const assignments = await prisma.sequenceAssignment.findMany({
      where: { leadId },
      include: {
        sequence: {
          include: {
            steps: {
              orderBy: { order: 'asc' },
            },
          },
        },
        activities: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching lead sequences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sequences' },
      { status: 500 }
    );
  }
}

// POST /api/crm/leads/[id]/sequences - Assign a sequence to a lead
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

    if (user?.role?.toLowerCase() !== 'admin' && !user?.employeeProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const leadId = params.id;
    const data = await request.json();

    if (!data.sequenceId) {
      return NextResponse.json(
        { error: 'Sequence ID is required' },
        { status: 400 }
      );
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check if sequence exists and is active
    const sequence = await prisma.sequence.findUnique({
      where: { id: data.sequenceId },
    });

    if (!sequence) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
    }

    if (sequence.status !== 'active' && sequence.status !== 'approved') {
      return NextResponse.json(
        { error: 'Only active or approved sequences can be assigned' },
        { status: 400 }
      );
    }

    // Check if this sequence is already assigned to this lead
    const existing = await prisma.sequenceAssignment.findFirst({
      where: {
        sequenceId: data.sequenceId,
        leadId: leadId,
        status: { in: ['pending', 'active'] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This sequence is already assigned to this lead' },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await prisma.sequenceAssignment.create({
      data: {
        sequenceId: data.sequenceId,
        leadId: leadId,
        assignedById: user.id,
        assignedBy: user.id,
        status: data.autoStart ? 'active' : 'pending',
        startedAt: data.autoStart ? new Date() : null,
        notes: data.notes,
      },
      include: {
        sequence: {
          include: {
            steps: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error('Error assigning sequence:', error);
    return NextResponse.json(
      { error: 'Failed to assign sequence' },
      { status: 500 }
    );
  }
}
