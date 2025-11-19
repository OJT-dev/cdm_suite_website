
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
export const runtime = 'edge';


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: any = {};
    
    // For clients, only show their workflows
    // @ts-ignore
    if (session.user.role === 'client') {
      // @ts-ignore
      where.userId = session.user.id;
    } else if (userId) {
      // Admins/employees can filter by userId
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    const workflows = await prisma.workflowInstance.findMany({
      where,
      include: {
        template: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ workflows });
  } catch (error: any) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (session.user.role !== 'admin' && session.user.role !== 'employee') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { templateId, userId, serviceName, serviceTier, serviceAmount, clientNotes } = await req.json();

    if (!templateId || !serviceName || !serviceAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the template
    const template = await prisma.workflowTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Parse tasks template
    const tasksTemplate = JSON.parse(template.tasksTemplate);

    // Calculate expected completion date
    const expectedCompletionDate = new Date();
    if (template.estimatedDuration) {
      expectedCompletionDate.setDate(expectedCompletionDate.getDate() + template.estimatedDuration);
    }

    // Create workflow instance
    const workflow = await prisma.workflowInstance.create({
      data: {
        templateId,
        userId,
        serviceName,
        serviceTier,
        serviceAmount,
        clientNotes,
        expectedCompletionDate,
        status: 'pending',
      },
    });

    // Create tasks
    const tasks = await Promise.all(
      tasksTemplate.map((taskTemplate: any, index: number) =>
        prisma.workflowTask.create({
          data: {
            workflowId: workflow.id,
            title: taskTemplate.title,
            description: taskTemplate.description,
            order: taskTemplate.order || index + 1,
            estimatedHours: taskTemplate.estimatedHours,
            requiredSkills: taskTemplate.requiredSkills || [],
            dependencies: taskTemplate.dependencies || [],
            visibleToClient: taskTemplate.visibleToClient || false,
            status: 'pending',
          },
        })
      )
    );

    return NextResponse.json({
      workflow,
      tasks,
      message: 'Workflow created successfully',
    });
  } catch (error: any) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
