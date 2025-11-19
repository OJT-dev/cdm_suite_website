

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getWorkflowTemplate } from '@/lib/workflow-templates';
export const runtime = 'edge';


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

    const { serviceType, serviceTier } = await req.json();

    if (!serviceType) {
      return NextResponse.json(
        { error: 'Service type is required' },
        { status: 400 }
      );
    }

    // Get the workflow template from lib
    const workflowTemplate = getWorkflowTemplate(serviceType, serviceTier);

    if (!workflowTemplate) {
      return NextResponse.json(
        { error: 'No template found for this service type' },
        { status: 404 }
      );
    }

    // Check if template already exists in DB
    const templateName = `${serviceType}-${serviceTier || 'growth'}`;
    let template = await prisma.workflowTemplate.findFirst({
      where: {
        name: templateName,
      },
    });

    // Create template if it doesn't exist
    if (!template) {
      template = await prisma.workflowTemplate.create({
        data: {
          name: templateName,
          serviceType,
          serviceTier: serviceTier || 'growth',
          estimatedDuration: workflowTemplate.estimatedDuration,
          estimatedHours: workflowTemplate.estimatedHours,
          tasksTemplate: JSON.stringify(workflowTemplate.tasks),
          milestones: JSON.stringify(workflowTemplate.milestones),
        },
      });
    }

    return NextResponse.json({
      template,
      preview: workflowTemplate,
    });
  } catch (error: any) {
    console.error('Error creating/fetching template:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get('serviceType');

    const where: any = {};
    if (serviceType) {
      where.serviceType = serviceType;
    }

    const templates = await prisma.workflowTemplate.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

