const fs = require('fs');

const filePath = 'lib/roles.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Update SALES_REP
content = content.replace(
  /(\[EMPLOYEE_ROLES\.SALES_REP\]: \{[\s\S]*?canViewLeads: true,\n)(\s+canEditLeads: true,\n\s+canAssignLeads: false,)/,
  '$1    canCreateLeads: true,\n    canEditLeads: true,\n    canDeleteLeads: false,\n    canAssignLeads: false,'
);

// Update DEVELOPER
content = content.replace(
  /(\[EMPLOYEE_ROLES\.DEVELOPER\]: \{[\s\S]*?canViewLeads: false,\n)(\s+canEditLeads: false,\n\s+canAssignLeads: false,)/,
  '$1    canCreateLeads: false,\n    canEditLeads: false,\n    canDeleteLeads: false,\n    canAssignLeads: false,'
);

// Update DESIGNER
content = content.replace(
  /(\[EMPLOYEE_ROLES\.DESIGNER\]: \{[\s\S]*?canViewLeads: false,\n)(\s+canEditLeads: false,\n\s+canAssignLeads: false,)/,
  '$1    canCreateLeads: false,\n    canEditLeads: false,\n    canDeleteLeads: false,\n    canAssignLeads: false,'
);

// Update SEO_SPECIALIST
content = content.replace(
  /(\[EMPLOYEE_ROLES\.SEO_SPECIALIST\]: \{[\s\S]*?canViewLeads: false,\n)(\s+canEditLeads: false,\n\s+canAssignLeads: false,)/,
  '$1    canCreateLeads: false,\n    canEditLeads: false,\n    canDeleteLeads: false,\n    canAssignLeads: false,'
);

// Update CONTENT_WRITER  
content = content.replace(
  /(\[EMPLOYEE_ROLES\.CONTENT_WRITER\]: \{[\s\S]*?canViewLeads: false,\n)(\s+canEditLeads: false,\n\s+canAssignLeads: false,)/,
  '$1    canCreateLeads: false,\n    canEditLeads: false,\n    canDeleteLeads: false,\n    canAssignLeads: false,'
);

// Update ADMIN_CAPABILITIES
content = content.replace(
  /(export const ADMIN_CAPABILITIES:[\s\S]*?canViewLeads: true,\n)(\s+canEditLeads: true,\n\s+canAssignLeads: true,)/,
  '$1  canCreateLeads: true,\n  canEditLeads: true,\n  canDeleteLeads: true,\n  canAssignLeads: true,'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated roles.ts successfully');
