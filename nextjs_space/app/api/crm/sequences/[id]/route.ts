
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/crm/sequences/[id] - Get a specific sequence
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

    if (user?.role !== 'admin' && !user?.employeeProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sequence = await prisma.sequence.findUnique({
      where: { id: params.id },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignments: {
          include: {
            lead: {
              select: {
                id: true,
                name: true,
                email: true,
                company: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!sequence) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
    }

    // Get performance metrics
    const allAssignments = await prisma.sequenceAssignment.findMany({
      where: { sequenceId: sequence.id },
    });

    const emailsSent = allAssignments.reduce(
      (sum: number, a: any) => sum + a.emailsSent,
      0
    );
    const emailsOpened = allAssignments.reduce(
      (sum: number, a: any) => sum + a.emailsOpened,
      0
    );
    const emailsClicked = allAssignments.reduce(
      (sum: number, a: any) => sum + a.emailsClicked,
      0
    );
    const emailsReplied = allAssignments.reduce(
      (sum: number, a: any) => sum + a.emailsReplied,
      0
    );
    const conversions = allAssignments.filter((a: any) => a.converted).length;

    const metrics = {
      totalAssignments: allAssignments.length,
      activeAssignments: allAssignments.filter(
        (a: any) => a.status === 'active'
      ).length,
      completedAssignments: allAssignments.filter(
        (a: any) => a.status === 'completed'
      ).length,
      emailsSent,
      emailsOpened,
      emailsClicked,
      emailsReplied,
      openRate: emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0,
      clickRate: emailsOpened > 0 ? (emailsClicked / emailsOpened) * 100 : 0,
      replyRate: emailsSent > 0 ? (emailsReplied / emailsSent) * 100 : 0,
      conversionRate: allAssignments.length > 0 ? (conversions / allAssignments.length) * 100 : 0,
    };

    return NextResponse.json({ sequence: { ...sequence, metrics } });
  } catch (error) {
    console.error('Error fetching sequence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sequence' },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/sequences/[id] - Update a sequence
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
      select: { id: true, role: true, employeeProfile: true },
    });

    if (user?.role !== 'admin' && !user?.employeeProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();

    // Update sequence
    const updateData: any = {
      name: data.name,
      description: data.description,
      type: data.type,
      targetAudience: data.targetAudience,
      status: data.status,
    };

    // Handle steps update if provided
    if (data.steps) {
      // Delete existing steps
      await prisma.sequenceStep.deleteMany({
        where: { sequenceId: params.id },
      });

      // Create new steps
      updateData.steps = {
        create: data.steps.map((step: any) => ({
          order: step.order,
          stepType: step.stepType,
          title: step.title,
          content: step.content,
          subject: step.subject,
          delayAmount: step.delayAmount || 0,
          delayUnit: step.delayUnit || 'hours',
          delayFrom: step.delayFrom || 'previous',
          conditions: step.conditions ? JSON.stringify(step.conditions) : null,
          aiSuggested: step.aiSuggested || false,
          aiReasoning: step.aiReasoning,
          mergeTags: step.mergeTags || [],
          active: step.active !== false,
        })),
      };
    }

    const sequence = await prisma.sequence.update({
      where: { id: params.id },
      data: updateData,
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ sequence });
  } catch (error) {
    console.error('Error updating sequence:', error);
    return NextResponse.json(
      { error: 'Failed to update sequence' },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/sequences/[id] - Delete a sequence
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only the master user (fray@cdmsuite.com) can delete sequences
    if (session.user.email !== 'fray@cdmsuite.com') {
      return NextResponse.json({ error: 'Only the master user can delete sequences' }, { status: 403 });
    }

    await prisma.sequence.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sequence:', error);
    return NextResponse.json(
      { error: 'Failed to delete sequence' },
      { status: 500 }
    );
  }
}

