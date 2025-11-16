import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEmployeeAccess() {
  try {
    console.log('🔧 Fixing employee access for @cdmsuite.com users...\n');

    // Find all @cdmsuite.com users
    const employees = await prisma.user.findMany({
      where: {
        email: {
          endsWith: '@cdmsuite.com',
        },
      },
      include: {
        employeeProfile: true,
      },
    });

    console.log(`Found ${employees.length} @cdmsuite.com users\n`);

    for (const employee of employees) {
      console.log(`Processing: ${employee.email}`);

      // Update user to employee role with enterprise tier
      await prisma.user.update({
        where: { id: employee.id },
        data: {
          role: 'employee',
          tier: 'enterprise',
          credits: 999999,
          subscriptionStatus: 'active',
          trialEndsAt: null,
        },
      });

      console.log(`  ✓ Updated role to employee with enterprise tier`);

      // Create employee profile if it doesn't exist
      if (!employee.employeeProfile) {
        await prisma.employee.create({
          data: {
            userId: employee.id,
            employeeRole: 'account_manager',
            department: 'sales',
            status: 'active',
            hireDate: new Date(),
            capabilities: JSON.stringify({
              canViewLeads: true,
              canCreateLeads: true,
              canEditLeads: true,
              canViewAllProjects: true,
            }),
          },
        });
        console.log(`  ✓ Created employee profile`);
      } else {
        console.log(`  ✓ Employee profile already exists`);
      }

      console.log('');
    }

    console.log('✅ All @cdmsuite.com users have been updated!\n');
    console.log('Summary:');
    console.log('- Role: employee');
    console.log('- Tier: enterprise (unlimited access)');
    console.log('- Credits: 999,999 (unlimited)');
    console.log('- Subscription Status: active');
    console.log('- Can view all leads in CRM');
    console.log('- Can view all projects');
    console.log('- Employee profiles created');
  } catch (error) {
    console.error('❌ Error fixing employee access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmployeeAccess();
