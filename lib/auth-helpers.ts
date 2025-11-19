
// Server-side authentication helpers for role-based access control

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isAdmin, isEmployee, getUserCapabilities } from '@/lib/roles';
import type { EmployeeCapabilities } from '@/lib/roles';

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  employeeProfile?: {
    employeeRole: string;
    capabilities: EmployeeCapabilities;
  } | null;
}

// Get current user session with role and capabilities
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      employeeProfile: {
        select: {
          employeeRole: true,
          capabilities: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    employeeProfile: user.employeeProfile
      ? {
          employeeRole: user.employeeProfile.employeeRole,
          capabilities: JSON.parse(user.employeeProfile.capabilities),
        }
      : null,
  };
}

// Check if current user is admin
export async function requireAdmin() {
  const user = await getCurrentUser();
  
  if (!user || !isAdmin(user.role)) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return user;
}

// Check if current user is admin or employee
export async function requireEmployee() {
  const user = await getCurrentUser();
  
  if (!user || (!isAdmin(user.role) && !isEmployee(user.role))) {
    throw new Error('Unauthorized: Employee access required');
  }
  
  return user;
}

// Check if user has specific capability
export async function requireCapability(capability: keyof EmployeeCapabilities) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Admins have all capabilities
  if (isAdmin(user.role)) {
    return user;
  }

  // Check employee capabilities
  if (isEmployee(user.role) && user.employeeProfile) {
    const capabilities = user.employeeProfile.capabilities;
    
    if (!capabilities[capability]) {
      throw new Error(`Unauthorized: Missing capability '${capability}'`);
    }
    
    return user;
  }

  throw new Error('Unauthorized');
}

// Get user capabilities
export async function getUserCapabilitiesForUser(userId: string): Promise<EmployeeCapabilities> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      employeeProfile: {
        select: {
          employeeRole: true,
          capabilities: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (isAdmin(user.role)) {
    return getUserCapabilities(user.role);
  }

  if (isEmployee(user.role) && user.employeeProfile) {
    const customCaps = JSON.parse(user.employeeProfile.capabilities);
    return getUserCapabilities(
      user.role,
      user.employeeProfile.employeeRole,
      customCaps
    );
  }

  return getUserCapabilities(user.role);
}

// Helper to check if an employee object has a specific permission
export function hasPermission(
  employee: { capabilities: string } | null | undefined,
  permission: keyof EmployeeCapabilities
): boolean {
  if (!employee) return false;
  
  try {
    const capabilities = JSON.parse(employee.capabilities);
    return capabilities[permission] === true;
  } catch (error) {
    console.error('Error parsing employee capabilities:', error);
    return false;
  }
}
