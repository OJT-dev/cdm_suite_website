

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assignTeamToWorkflow } from '@/lib/team-assignment';

export async function POST(
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

    // Get workflow with tasks
    const workflow = await prisma.workflowInstance.findUnique({
      where: { id: params.id },
      include: {
        tasks: true,
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (workflow.teamAssigned) {
      return NextResponse.json(
        { error: 'Team already assigned to this workflow' },
        { status: 400 }
      );
    }

    // Assign team using the smart assignment algorithm
    await assignTeamToWorkflow(
      workflow.id,
      workflow.tasks.map((t: any) => ({
        id: t.id,
        requiredSkills: t.requiredSkills,
        estimatedHours: t.estimatedHours || 0,
      }))
    );

    // Fetch updated workflow with assignments
    const updatedWorkflow = await prisma.workflowInstance.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          include: {
            assignedTo: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        teamAssignments: {
          include: {
            employee: {
              include: {
                user: {
                  select: {
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

    return NextResponse.json({
      workflow: updatedWorkflow,
      message: 'Team assigned successfully',
    });
  } catch (error: any) {
    console.error('Error assigning team:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
