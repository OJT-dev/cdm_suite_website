export const runtime = 'edge';


export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/crm/leads - List leads
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employeeProfile: true },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedToId = searchParams.get('assignedToId');
    const source = searchParams.get('source'); // Filter by sign-up type/source

    const where: any = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (source) where.source = source;

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: true,
        activities: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST /api/crm/leads - Create new lead
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employeeProfile: true },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      name,
      phone,
      company,
      source,
      interest,
      status,
      priority,
      assignedToId,
      budget,
      timeline,
      notes,
      tags,
    } = body;

    // Validate required fields - only source is required now
    if (!source) {
      return NextResponse.json(
        { error: 'Source is required' },
        { status: 400 }
      );
    }

    // At least one contact method (email or phone) should be provided
    if (!email && !phone && !name) {
      return NextResponse.json(
        { error: 'Please provide at least a name, email, or phone number' },
        { status: 400 }
      );
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        email,
        name,
        phone,
        company,
        source,
        interest,
        status: status || 'new',
        priority: priority || 'medium',
        assignedToId,
        budget,
        timeline,
        notes,
        tags: tags || [],
        score: 0,
      },
      include: {
        assignedTo: true,
      },
    });

    // Create activity log
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'note',
        title: 'Lead Created',
        description: `Lead created by ${user.name || user.email}`,
        createdById: user.id,
      },
    });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
