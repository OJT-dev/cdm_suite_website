
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/crm/sequences - List all sequences with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or employee
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, employeeProfile: true },
    });

    if (user?.role?.toLowerCase() !== 'admin' && !user?.employeeProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const targetAudience = searchParams.get('targetAudience');
    const aiGenerated = searchParams.get('aiGenerated');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (targetAudience) where.targetAudience = targetAudience;
    if (aiGenerated !== null) where.aiGenerated = aiGenerated === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const sequences = await prisma.sequence.findMany({
      where,
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
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get performance metrics for each sequence
    const sequencesWithMetrics = await Promise.all(
      sequences.map(async (sequence: any) => {
        const assignments = await prisma.sequenceAssignment.findMany({
          where: { sequenceId: sequence.id },
          select: {
            status: true,
            emailsSent: true,
            emailsOpened: true,
            emailsClicked: true,
            emailsReplied: true,
            converted: true,
          },
        });

        const emailsSent = assignments.reduce(
          (sum: number, a: any) => sum + a.emailsSent,
          0
        );
        const emailsOpened = assignments.reduce(
          (sum: number, a: any) => sum + a.emailsOpened,
          0
        );
        const emailsClicked = assignments.reduce(
          (sum: number, a: any) => sum + a.emailsClicked,
          0
        );
        const emailsReplied = assignments.reduce(
          (sum: number, a: any) => sum + a.emailsReplied,
          0
        );
        const conversions = assignments.filter((a: any) => a.converted).length;

        return {
          ...sequence,
          metrics: {
            totalAssignments: assignments.length,
            activeAssignments: assignments.filter(
              (a: any) => a.status === 'active'
            ).length,
            emailsSent,
            emailsOpened,
            emailsClicked,
            emailsReplied,
            openRate: emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0,
            clickRate:
              emailsOpened > 0 ? (emailsClicked / emailsOpened) * 100 : 0,
            replyRate:
              emailsSent > 0 ? (emailsReplied / emailsSent) * 100 : 0,
            conversionRate:
              assignments.length > 0
                ? (conversions / assignments.length) * 100
                : 0,
          },
        };
      })
    );

    return NextResponse.json({ sequences: sequencesWithMetrics });
  } catch (error) {
    console.error('Error fetching sequences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sequences' },
      { status: 500 }
    );
  }
}

// POST /api/crm/sequences - Create a new sequence
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

    if (user?.role?.toLowerCase() !== 'admin' && !user?.employeeProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.type || !data.targetAudience) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create sequence with steps
    const sequence = await prisma.sequence.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        targetAudience: data.targetAudience,
        aiGenerated: data.aiGenerated || false,
        aiPrompt: data.aiPrompt,
        status: data.status || 'pending',
        createdBy: user.id,
        steps: {
          create: (data.steps || []).map((step: any) => ({
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
        },
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ sequence }, { status: 201 });
  } catch (error) {
    console.error('Error creating sequence:', error);
    return NextResponse.json(
      { error: 'Failed to create sequence' },
      { status: 500 }
    );
  }
}

