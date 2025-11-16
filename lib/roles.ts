
// Role-based access control types and utilities

export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const EMPLOYEE_ROLES = {
  ACCOUNT_MANAGER: 'account_manager',
  SALES_REP: 'sales_rep',
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
  SEO_SPECIALIST: 'seo_specialist',
  CONTENT_WRITER: 'content_writer',
} as const;

export type EmployeeRole = typeof EMPLOYEE_ROLES[keyof typeof EMPLOYEE_ROLES];

export const DEPARTMENTS = {
  SALES: 'sales',
  FULFILLMENT: 'fulfillment',
  MARKETING: 'marketing',
  DEVELOPMENT: 'development',
} as const;

export type Department = typeof DEPARTMENTS[keyof typeof DEPARTMENTS];

// Capability/Permission definitions
export interface EmployeeCapabilities {
  // AI & Automation
  canApproveSequences: boolean;
  canCreateSequences: boolean;
  canViewAIRecommendations: boolean;
  canApproveAIRecommendations: boolean;
  
  // Project Management
  canViewAllProjects: boolean;
  canViewAssignedProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canAssignProjects: boolean;
  
  // Task Management
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canReassignTasks: boolean;
  
  // File Management
  canUploadFiles: boolean;
  canViewClientFiles: boolean;
  canEditClientFiles: boolean;
  canDeleteFiles: boolean;
  
  // Client Communication
  canMessageClients: boolean;
  canViewClientMessages: boolean;
  canSendClientEmails: boolean;
  
  // Lead Management
  canViewLeads: boolean;
  canCreateLeads: boolean;
  canEditLeads: boolean;
  canDeleteLeads: boolean;
  canAssignLeads: boolean;
  
  // Time Tracking
  canLogTime: boolean;
  canApproveTime: boolean;
  canViewTeamTime: boolean;
  
  // Analytics & Reports
  canViewAnalytics: boolean;
  canViewFinancials: boolean;
  canExportReports: boolean;
  
  // Employee Management
  canManageEmployees: boolean;
  canViewEmployeePerformance: boolean;
}

// Default capabilities by role
export const DEFAULT_CAPABILITIES: Record<EmployeeRole, EmployeeCapabilities> = {
  [EMPLOYEE_ROLES.ACCOUNT_MANAGER]: {
    canApproveSequences: true,
    canCreateSequences: true,
    canViewAIRecommendations: true,
    canApproveAIRecommendations: true,
    canViewAllProjects: true,
    canViewAssignedProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canAssignProjects: true,
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: true,
    canReassignTasks: true,
    canUploadFiles: true,
    canViewClientFiles: true,
    canEditClientFiles: true,
    canDeleteFiles: false,
    canMessageClients: true,
    canViewClientMessages: true,
    canSendClientEmails: true,
    canViewLeads: true,
    canCreateLeads: true,
    canEditLeads: true,
    canDeleteLeads: false,
    canAssignLeads: true,
    canLogTime: true,
    canApproveTime: false,
    canViewTeamTime: true,
    canViewAnalytics: true,
    canViewFinancials: true,
    canExportReports: true,
    canManageEmployees: false,
    canViewEmployeePerformance: true,
  },
  [EMPLOYEE_ROLES.SALES_REP]: {
    canApproveSequences: false,
    canCreateSequences: false,
    canViewAIRecommendations: true,
    canApproveAIRecommendations: false,
    canViewAllProjects: false,
    canViewAssignedProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canAssignProjects: false,
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: false,
    canReassignTasks: false,
    canUploadFiles: true,
    canViewClientFiles: true,
    canEditClientFiles: false,
    canDeleteFiles: false,
    canMessageClients: true,
    canViewClientMessages: true,
    canSendClientEmails: true,
    canViewLeads: true,
    canCreateLeads: true,
    canEditLeads: true,
    canDeleteLeads: false,
    canAssignLeads: false,
    canLogTime: true,
    canApproveTime: false,
    canViewTeamTime: false,
    canViewAnalytics: true,
    canViewFinancials: false,
    canExportReports: true,
    canManageEmployees: false,
    canViewEmployeePerformance: false,
  },
  [EMPLOYEE_ROLES.DEVELOPER]: {
    canApproveSequences: false,
    canCreateSequences: false,
    canViewAIRecommendations: true,
    canApproveAIRecommendations: false,
    canViewAllProjects: true, // Changed to true - devs need to see all projects
    canViewAssignedProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canAssignProjects: false,
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: false,
    canReassignTasks: false,
    canUploadFiles: true,
    canViewClientFiles: true,
    canEditClientFiles: true,
    canDeleteFiles: false,
    canMessageClients: true,
    canViewClientMessages: true,
    canSendClientEmails: false,
    canViewLeads: true, // Changed to true - all employees can see leads
    canCreateLeads: true, // Changed to true - all employees can create leads
    canEditLeads: true, // Changed to true - all employees can edit leads
    canDeleteLeads: false,
    canAssignLeads: false,
    canLogTime: true,
    canApproveTime: false,
    canViewTeamTime: false,
    canViewAnalytics: true, // Changed to true
    canViewFinancials: false,
    canExportReports: false,
    canManageEmployees: false,
    canViewEmployeePerformance: false,
  },
  [EMPLOYEE_ROLES.DESIGNER]: {
    canApproveSequences: false,
    canCreateSequences: false,
    canViewAIRecommendations: true,
    canApproveAIRecommendations: false,
    canViewAllProjects: true, // Changed to true - designers need to see all projects
    canViewAssignedProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canAssignProjects: false,
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: false,
    canReassignTasks: false,
    canUploadFiles: true,
    canViewClientFiles: true,
    canEditClientFiles: true,
    canDeleteFiles: false,
    canMessageClients: true,
    canViewClientMessages: true,
    canSendClientEmails: false,
    canViewLeads: true, // Changed to true - all employees can see leads
    canCreateLeads: true, // Changed to true - all employees can create leads
    canEditLeads: true, // Changed to true - all employees can edit leads
    canDeleteLeads: false,
    canAssignLeads: false,
    canLogTime: true,
    canApproveTime: false,
    canViewTeamTime: false,
    canViewAnalytics: true, // Changed to true
    canViewFinancials: false,
    canExportReports: false,
    canManageEmployees: false,
    canViewEmployeePerformance: false,
  },
  [EMPLOYEE_ROLES.SEO_SPECIALIST]: {
    canApproveSequences: false,
    canCreateSequences: true, // Changed to true - SEO specialists create content sequences
    canViewAIRecommendations: true,
    canApproveAIRecommendations: false,
    canViewAllProjects: true, // Changed to true - SEO specialists need to see all projects
    canViewAssignedProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canAssignProjects: false,
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: false,
    canReassignTasks: false,
    canUploadFiles: true,
    canViewClientFiles: true,
    canEditClientFiles: false,
    canDeleteFiles: false,
    canMessageClients: true,
    canViewClientMessages: true,
    canSendClientEmails: false,
    canViewLeads: true, // Changed to true - all employees can see leads
    canCreateLeads: true, // Changed to true - all employees can create leads
    canEditLeads: true, // Changed to true - all employees can edit leads
    canDeleteLeads: false,
    canAssignLeads: false,
    canLogTime: true,
    canApproveTime: false,
    canViewTeamTime: false,
    canViewAnalytics: true,
    canViewFinancials: false,
    canExportReports: true,
    canManageEmployees: false,
    canViewEmployeePerformance: false,
  },
  [EMPLOYEE_ROLES.CONTENT_WRITER]: {
    canApproveSequences: false,
    canCreateSequences: true, // Changed to true - content writers create content
    canViewAIRecommendations: true,
    canApproveAIRecommendations: false,
    canViewAllProjects: true, // Changed to true - content writers need to see all projects
    canViewAssignedProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canAssignProjects: false,
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: false,
    canReassignTasks: false,
    canUploadFiles: true,
    canViewClientFiles: true,
    canEditClientFiles: false,
    canDeleteFiles: false,
    canMessageClients: true,
    canViewClientMessages: true,
    canSendClientEmails: false,
    canViewLeads: true, // Changed to true - all employees can see leads
    canCreateLeads: true, // Changed to true - all employees can create leads
    canEditLeads: true, // Changed to true - all employees can edit leads
    canDeleteLeads: false,
    canAssignLeads: false,
    canLogTime: true,
    canApproveTime: false,
    canViewTeamTime: false,
    canViewAnalytics: true, // Changed to true
    canViewFinancials: false,
    canExportReports: false,
    canManageEmployees: false,
    canViewEmployeePerformance: false,
  },
};

// Admin has all capabilities
export const ADMIN_CAPABILITIES: EmployeeCapabilities = {
  canApproveSequences: true,
  canCreateSequences: true,
  canViewAIRecommendations: true,
  canApproveAIRecommendations: true,
  canViewAllProjects: true,
  canViewAssignedProjects: true,
  canEditProjects: true,
  canDeleteProjects: true,
  canAssignProjects: true,
  canCreateTasks: true,
  canEditTasks: true,
  canDeleteTasks: true,
  canReassignTasks: true,
  canUploadFiles: true,
  canViewClientFiles: true,
  canEditClientFiles: true,
  canDeleteFiles: true,
  canMessageClients: true,
  canViewClientMessages: true,
  canSendClientEmails: true,
  canViewLeads: true,
  canCreateLeads: true,
  canEditLeads: true,
  canDeleteLeads: true,
  canAssignLeads: true,
  canLogTime: true,
  canApproveTime: true,
  canViewTeamTime: true,
  canViewAnalytics: true,
  canViewFinancials: true,
  canExportReports: true,
  canManageEmployees: true,
  canViewEmployeePerformance: true,
};

// Check if user has admin role
export function isAdmin(userRole: string): boolean {
  return userRole?.toLowerCase() === USER_ROLES.ADMIN;
}

// Check if user is an employee
export function isEmployee(userRole: string): boolean {
  return userRole?.toLowerCase() === USER_ROLES.EMPLOYEE;
}

// Check if user is a client
export function isClient(userRole: string): boolean {
  return userRole?.toLowerCase() === USER_ROLES.CLIENT;
}

// Get capabilities for a user
export function getUserCapabilities(
  userRole: string,
  employeeRole?: string,
  customCapabilities?: Partial<EmployeeCapabilities>
): EmployeeCapabilities {
  // Admin has all capabilities
  if (isAdmin(userRole)) {
    return ADMIN_CAPABILITIES;
  }

  // If not admin or employee, return empty capabilities
  if (!isEmployee(userRole)) {
    return Object.keys(ADMIN_CAPABILITIES).reduce((acc, key) => {
      acc[key as keyof EmployeeCapabilities] = false;
      return acc;
    }, {} as EmployeeCapabilities);
  }

  // Get default capabilities for employee role
  const defaultCaps = employeeRole && employeeRole in DEFAULT_CAPABILITIES
    ? DEFAULT_CAPABILITIES[employeeRole as EmployeeRole]
    : DEFAULT_CAPABILITIES[EMPLOYEE_ROLES.DEVELOPER];

  // Merge with custom capabilities if provided
  return {
    ...defaultCaps,
    ...customCapabilities,
  };
}

// Check if user has a specific capability
export function hasCapability(
  capabilities: EmployeeCapabilities,
  capability: keyof EmployeeCapabilities
): boolean {
  return capabilities[capability] || false;
}

// Get role display name
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    admin: 'Administrator',
    employee: 'Employee',
    client: 'Client',
    account_manager: 'Account Manager',
    sales_rep: 'Sales Representative',
    developer: 'Developer',
    designer: 'Designer',
    seo_specialist: 'SEO Specialist',
    content_writer: 'Content Writer',
  };

  return roleNames[role] || role;
}

// Get department display name
export function getDepartmentDisplayName(department: string): string {
  const deptNames: Record<string, string> = {
    sales: 'Sales',
    fulfillment: 'Fulfillment',
    marketing: 'Marketing',
    development: 'Development',
  };

  return deptNames[department] || department;
}
