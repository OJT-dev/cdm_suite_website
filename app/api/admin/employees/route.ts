export const runtime = 'edge';


export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';
import { DEFAULT_CAPABILITIES, EMPLOYEE_ROLES } from '@/lib/roles';
import bcrypt from 'bcryptjs';

// GET all employees
export async function GET() {
  try {
    await requireAdmin();

    const employees = await prisma.employee.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse capabilities JSON
    const employeesWithParsedCaps = employees.map((emp: any) => ({
      ...emp,
      capabilities: JSON.parse(emp.capabilities),
    }));

    return NextResponse.json(employeesWithParsedCaps);
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch employees' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// POST create new employee
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      email,
      name,
      phone,
      password,
      employeeRole,
      department,
      capabilities,
      weeklyCapacity,
      skillSet,
    } = body;

    // Validate required fields
    if (!email || !name || !password || !employeeRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default capabilities if not provided
    const defaultCaps = employeeRole in DEFAULT_CAPABILITIES
      ? DEFAULT_CAPABILITIES[employeeRole as keyof typeof DEFAULT_CAPABILITIES]
      : DEFAULT_CAPABILITIES['developer'];

    const finalCapabilities = capabilities || defaultCaps;

    // Create user and employee profile in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          email,
          name,
          phone,
          password: hashedPassword,
          role: 'employee',
        },
      });

      // Create employee profile
      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeRole,
          department,
          capabilities: JSON.stringify(finalCapabilities),
          weeklyCapacity: weeklyCapacity || 40,
          skillSet: skillSet || [],
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              createdAt: true,
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
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create employee' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
