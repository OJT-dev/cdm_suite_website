
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflow = await prisma.workflowInstance.findUnique({
      where: { id: params.id },
      include: {
        template: true,
        tasks: {
          include: {
            assignedTo: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        teamAssignments: {
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Check permissions
    // @ts-ignore
    if (session.user.role === 'client' && workflow.userId !== session.user.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json({ workflow });
  } catch (error: any) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (session.user.role !== 'admin' && session.user.role !== 'employee') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { status, progress, internalNotes, clientNotes, expectedCompletionDate } = await req.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof progress === 'number') updateData.progress = progress;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (clientNotes !== undefined) updateData.clientNotes = clientNotes;
    if (expectedCompletionDate) updateData.expectedCompletionDate = new Date(expectedCompletionDate);

    // Handle status transitions
    if (status === 'in_progress' && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === 'completed') {
      updateData.completedAt = new Date();
      updateData.progress = 100;
    }

    const workflow = await prisma.workflowInstance.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ workflow, message: 'Workflow updated successfully' });
  } catch (error: any) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
