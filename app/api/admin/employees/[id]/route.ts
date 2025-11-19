
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';
import bcrypt from 'bcryptjs';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET single employee
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();

    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            image: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...employee,
      capabilities: JSON.parse(employee.capabilities),
    });
  } catch (error: any) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch employee' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// PATCH update employee
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      name,
      phone,
      password,
      employeeRole,
      department,
      capabilities,
      weeklyCapacity,
      skillSet,
      status,
    } = body;

    // Get existing employee
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Update user data
      const userData: any = {};
      if (name !== undefined) userData.name = name;
      if (phone !== undefined) userData.phone = phone;
      if (password) {
        userData.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: existingEmployee.userId },
          data: userData,
        });
      }

      // Update employee data
      const employeeData: any = {};
      if (employeeRole !== undefined) employeeData.employeeRole = employeeRole;
      if (department !== undefined) employeeData.department = department;
      if (capabilities !== undefined) {
        employeeData.capabilities = JSON.stringify(capabilities);
      }
      if (weeklyCapacity !== undefined) employeeData.weeklyCapacity = weeklyCapacity;
      if (skillSet !== undefined) employeeData.skillSet = skillSet;
      if (status !== undefined) employeeData.status = status;

      const employee = await tx.employee.update({
        where: { id: params.id },
        data: employeeData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              image: true,
              createdAt: true,
              lastLoginAt: true,
            },
          },
        },
      });

      return employee;
    });

    return NextResponse.json({
      ...result,
      capabilities: JSON.parse(result.capabilities),
    });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update employee' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// DELETE employee
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAdmin();

    // Only the master user (fray@cdmsuite.com) can delete employees
    if (user.email !== 'fray@cdmsuite.com') {
      return NextResponse.json(
        { error: 'Only the master user can delete employees' },
        { status: 403 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Delete employee (will cascade to user due to onDelete: Cascade)
    await prisma.employee.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete employee' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
