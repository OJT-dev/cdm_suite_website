
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function updateAdminAccess() {
  try {
    console.log('🔍 Checking current status for everoythomas@gmail.com...');
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'everoythomas@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tier: true,
        employeeProfile: true,
      },
    });

    if (!user) {
      console.log('❌ User everoythomas@gmail.com not found in database');
      return;
    }

    console.log('\n📋 Current user details:');
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Tier: ${user.tier}`);
    console.log(`  Has Employee Profile: ${user.employeeProfile ? 'Yes' : 'No'}`);

    if (user.role === 'admin') {
      console.log('\n✅ User already has admin access');
    } else {
      // Update user to admin
      console.log('\n🔄 Updating user role to admin...');
      const updatedUser = await prisma.user.update({
        where: { email: 'everoythomas@gmail.com' },
        data: {
          role: 'admin',
        },
      });
      console.log('✅ Successfully updated user role to admin');
    }

    // Create employee profile if it doesn't exist
    if (!user.employeeProfile) {
      console.log('\n🔄 Creating employee profile...');
      await prisma.employee.create({
        data: {
          userId: user.id,
          employeeRole: 'account_manager',
          department: 'operations',
          capabilities: JSON.stringify({
            canApproveSequences: true,
            canEditClientFiles: true,
            canMessageClients: true,
            canViewAllProjects: true,
            canManageLeads: true,
            canCreateProposals: true,
            canManageEmployees: true,
            canAccessReports: true,
            canManageBilling: true,
          }),
          weeklyCapacity: 40,
          skillSet: ['management', 'sales', 'operations'],
          status: 'active',
        },
      });
      console.log('✅ Employee profile created');
    }

    // Verify the update
    console.log('\n🔍 Verifying update...');
    const verifiedUser = await prisma.user.findUnique({
      where: { email: 'everoythomas@gmail.com' },
      select: {
        email: true,
        name: true,
        role: true,
        employeeProfile: {
          select: {
            employeeRole: true,
            department: true,
            status: true,
          },
        },
      },
    });

    console.log('\n✅ Updated user details:');
    console.log(`  Name: ${verifiedUser?.name}`);
    console.log(`  Email: ${verifiedUser?.email}`);
    console.log(`  Role: ${verifiedUser?.role}`);
    if (verifiedUser?.employeeProfile) {
      console.log(`  Employee Role: ${verifiedUser.employeeProfile.employeeRole}`);
      console.log(`  Department: ${verifiedUser.employeeProfile.department}`);
      console.log(`  Status: ${verifiedUser.employeeProfile.status}`);
    }

    console.log('\n✨ Admin access granted successfully!');
    console.log('🔐 The user can now access all admin features including:');
    console.log('  • Lead CRM');
    console.log('  • Proposals');
    console.log('  • Sequence Management');
    console.log('  • Project Management');
    console.log('  • All Admin Controls');

  } catch (error) {
    console.error('❌ Error updating admin access:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminAccess();
