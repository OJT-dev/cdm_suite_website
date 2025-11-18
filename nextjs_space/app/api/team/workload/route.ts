
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getEmployeeWorkload } from '@/lib/team-assignment';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (session.user.role !== 'admin' && session.user.role !== 'employee') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (employeeId) {
      // Get specific employee workload
      const workload = await getEmployeeWorkload(employeeId);
      return NextResponse.json({ workload });
    }

    // Get all employees workload summary
    const employees = await prisma.employee.findMany({
      where: {
        status: 'active',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        workflowTasks: {
          where: {
            status: {
              in: ['assigned', 'in_progress'],
            },
          },
        },
        teamAssignments: {
          where: {
            status: 'active',
          },
        },
      },
    });

    const workloadSummary = employees.map((emp: any) => ({
      id: emp.id,
      name: emp.user.name,
      email: emp.user.email,
      role: emp.employeeRole,
      department: emp.department,
      capacity: {
        weekly: emp.weeklyCapacity,
        current: emp.currentWorkload,
        available: emp.weeklyCapacity - emp.currentWorkload,
        utilizationRate: Math.round((emp.currentWorkload / emp.weeklyCapacity) * 100),
      },
      projects: {
        current: emp.currentProjectCount,
        max: emp.maxConcurrentProjects,
      },
      tasks: emp.workflowTasks.length,
      assignments: emp.teamAssignments.length,
      status: emp.availableForWork ? 'available' : 'unavailable',
    }));

    return NextResponse.json({ employees: workloadSummary });
  } catch (error: any) {
    console.error('Error fetching team workload:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
