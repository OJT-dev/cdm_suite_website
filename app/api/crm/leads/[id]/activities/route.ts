
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasPermission } from '@/lib/auth-helpers';

// GET /api/crm/leads/[id]/activities - Get all activities for a lead
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activities = await prisma.leadActivity.findMany({
      where: { leadId: params.id },
      include: {
        createdBy: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/crm/leads/[id]/activities - Create a new activity
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employeeProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { type, title, description, metadata } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    const activity = await prisma.leadActivity.create({
      data: {
        leadId: params.id,
        type,
        title,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdById: user.employeeProfile?.id
      },
      include: {
        createdBy: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    // Update lastContactedAt if this is a contact activity
    if (['email', 'call', 'meeting'].includes(type)) {
      await prisma.lead.update({
        where: { id: params.id },
        data: { lastContactedAt: new Date() }
      });
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity', details: error.message },
      { status: 500 }
    );
  }
}
