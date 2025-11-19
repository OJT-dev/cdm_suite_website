export const runtime = 'edge';


export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    const { taskId, status, assignedToId, actualHours, completedWork, blockedReason } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'in_progress' && !updateData.startedAt) {
        updateData.startedAt = new Date();
      }
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
      if (status === 'blocked' && blockedReason) {
        updateData.blockedReason = blockedReason;
      }
    }
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    if (completedWork !== undefined) updateData.completedWork = completedWork;

    const task = await prisma.workflowTask.update({
      where: { id: taskId },
      data: updateData,
    });

    // Recalculate workflow progress
    const allTasks = await prisma.workflowTask.findMany({
      where: { workflowId: params.id },
    });

    const completedTasks = allTasks.filter((t: any) => t.status === 'completed').length;
    const progress = Math.round((completedTasks / allTasks.length) * 100);

    await prisma.workflowInstance.update({
      where: { id: params.id },
      data: { progress },
    });

    return NextResponse.json({ task, progress, message: 'Task updated successfully' });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
