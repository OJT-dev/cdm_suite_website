
// Team assignment logic with skills matching and load balancing

import { prisma } from '@/lib/db';

interface TaskRequirement {
  requiredSkills: string[];
  estimatedHours: number;
}

interface EmployeeCapacity {
  id: string;
  userId: string;
  skillSet: string[];
  expertiseLevel: string;
  weeklyCapacity: number;
  currentWorkload: number;
  availableForWork: boolean;
  currentProjectCount: number;
  maxConcurrentProjects: number;
  avgProjectRating?: number;
}

/**
 * Find the best employee to assign to a task based on skills and availability
 */
export async function findBestEmployeeForTask(task: TaskRequirement): Promise<string | null> {
  // Get all available employees
  const employees = await prisma.employee.findMany({
    where: {
      status: 'active',
      availableForWork: true,
    },
  });

  if (employees.length === 0) return null;

  // Score each employee
  const scoredEmployees = employees.map((emp: any) => {
    let score = 0;

    // Skill match score (0-40 points)
    const matchedSkills = task.requiredSkills.filter(skill => 
      emp.skillSet.includes(skill)
    );
    const skillMatchRate = matchedSkills.length / task.requiredSkills.length;
    score += skillMatchRate * 40;

    // Availability score (0-30 points)
    const availableHours = emp.weeklyCapacity - emp.currentWorkload;
    if (availableHours >= task.estimatedHours) {
      score += 30;
    } else {
      score += (availableHours / task.estimatedHours) * 30;
    }

    // Expertise score (0-15 points)
    const expertisePoints = {
      'junior': 5,
      'intermediate': 10,
      'senior': 13,
      'expert': 15,
    };
    score += expertisePoints[emp.expertiseLevel as keyof typeof expertisePoints] || 10;

    // Performance score (0-15 points)
    if (emp.avgProjectRating) {
      score += (emp.avgProjectRating / 5) * 15;
    } else {
      score += 10; // Default score for new employees
    }

    // Project capacity penalty
    if (emp.currentProjectCount >= emp.maxConcurrentProjects) {
      score -= 20;
    }

    return {
      employeeId: emp.id,
      score,
      availableHours,
    };
  });

  // Sort by score (descending)
  scoredEmployees.sort(
    (a: { score: number }, b: { score: number }) => b.score - a.score
  );

  // Return the best match if score is above threshold
  const bestMatch = scoredEmployees[0];
  if (bestMatch && bestMatch.score >= 50) {
    return bestMatch.employeeId;
  }

  return null;
}

/**
 * Assign team to a workflow based on required skills
 */
export async function assignTeamToWorkflow(
  workflowId: string,
  tasks: Array<{
    id: string;
    requiredSkills: string[];
    estimatedHours: number;
  }>
): Promise<void> {
  const assignedEmployees = new Map<string, Set<string>>(); // employeeId -> Set of taskIds

  // First pass: assign tasks to best-fit employees
  for (const task of tasks) {
    const employeeId = await findBestEmployeeForTask({
      requiredSkills: task.requiredSkills,
      estimatedHours: task.estimatedHours,
    });

    if (employeeId) {
      // Update task assignment
      await prisma.workflowTask.update({
        where: { id: task.id },
        data: {
          assignedToId: employeeId,
          status: 'assigned',
        },
      });

      // Track assigned employees
      if (!assignedEmployees.has(employeeId)) {
        assignedEmployees.set(employeeId, new Set());
      }
      assignedEmployees.get(employeeId)?.add(task.id);

      // Update employee workload
      await prisma.employee.update({
        where: { id: employeeId },
        data: {
          currentWorkload: {
            increment: task.estimatedHours,
          },
        },
      });
    }
  }

  // Create team assignments for all assigned employees
  for (const [employeeId, taskIds] of assignedEmployees.entries()) {
    const totalHours = tasks
      .filter(t => taskIds.has(t.id))
      .reduce((sum, t) => sum + t.estimatedHours, 0);

    // Determine role based on number of tasks
    const role = taskIds.size >= tasks.length * 0.5 ? 'lead' : 'contributor';

    await prisma.teamAssignment.create({
      data: {
        workflowId,
        employeeId,
        role,
        allocatedHours: totalHours,
        status: 'active',
      },
    });

    // Update employee project count
    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        currentProjectCount: {
          increment: 1,
        },
      },
    });
  }

  // Mark workflow as team assigned
  await prisma.workflowInstance.update({
    where: { id: workflowId },
    data: {
      teamAssigned: true,
      status: 'in_progress',
      startedAt: new Date(),
    },
  });
}

/**
 * Get employee workload summary
 */
export async function getEmployeeWorkload(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      teamAssignments: {
        where: {
          status: 'active',
        },
        include: {
          workflow: true,
        },
      },
      workflowTasks: {
        where: {
          status: {
            in: ['assigned', 'in_progress'],
          },
        },
        include: {
          workflow: true,
        },
      },
    },
  });

  if (!employee) return null;

  return {
    employee: {
      id: employee.id,
      name: employee.userId,
      role: employee.employeeRole,
      department: employee.department,
    },
    capacity: {
      weekly: employee.weeklyCapacity,
      current: employee.currentWorkload,
      available: employee.weeklyCapacity - employee.currentWorkload,
      utilizationRate: (employee.currentWorkload / employee.weeklyCapacity) * 100,
    },
    projects: {
      current: employee.currentProjectCount,
      max: employee.maxConcurrentProjects,
    },
    assignments: employee.teamAssignments.length,
    tasks: employee.workflowTasks.length,
  };
}
