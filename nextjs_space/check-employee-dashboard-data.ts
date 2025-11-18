
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkDashboardData() {
  try {
    console.log('\n🔍 CHECKING DASHBOARD DATA...\n');

    // Check total leads
    const totalLeads = await prisma.lead.count();
    console.log(`📊 Total Leads in Database: ${totalLeads}`);

    if (totalLeads > 0) {
      const leadsByStatus = await prisma.lead.groupBy({
        by: ['status'],
        _count: true,
      });
      console.log('   Leads by status:');
      leadsByStatus.forEach(group => {
        console.log(`   - ${group.status}: ${group._count}`);
      });

      // Show last 5 leads
      const recentLeads = await prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
        },
      });
      console.log('\n   Recent leads:');
      recentLeads.forEach(lead => {
        console.log(`   - ${lead.name || lead.email} (${lead.status}) - Created: ${lead.createdAt.toLocaleDateString()}`);
      });
    }

    // Check total proposals
    const totalProposals = await prisma.proposal.count();
    console.log(`\n📄 Total Proposals in Database: ${totalProposals}`);

    if (totalProposals > 0) {
      const proposalsByStatus = await prisma.proposal.groupBy({
        by: ['status'],
        _count: true,
      });
      console.log('   Proposals by status:');
      proposalsByStatus.forEach(group => {
        console.log(`   - ${group.status}: ${group._count}`);
      });

      // Show last 5 proposals
      const recentProposals = await prisma.proposal.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          proposalNumber: true,
          title: true,
          status: true,
          total: true,
          createdAt: true,
        },
      });
      console.log('\n   Recent proposals:');
      recentProposals.forEach(proposal => {
        console.log(`   - ${proposal.proposalNumber}: ${proposal.title} (${proposal.status}) - $${proposal.total}`);
      });
    }

    // Check @cdmsuite.com users
    console.log('\n👥 CHECKING EMPLOYEE ACCOUNTS...\n');
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

    console.log(`📧 Found ${employees.length} @cdmsuite.com users:\n`);
    employees.forEach(user => {
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'Not set'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Tier: ${user.tier}`);
      console.log(`   Credits: ${user.credits}`);
      console.log(`   Employee Profile: ${user.employeeProfile ? 
        `${user.employeeProfile.employeeRole} (${user.employeeProfile.department || 'No dept'})` : 
        '❌ NOT SET'}`);
      console.log('   ---');
    });

    // Check for any other users (non-employee)
    const otherUsers = await prisma.user.findMany({
      where: {
        email: {
          not: {
            endsWith: '@cdmsuite.com',
          },
        },
      },
      select: {
        email: true,
        role: true,
      },
    });

    console.log(`\n👤 Other Users: ${otherUsers.length}`);
    if (otherUsers.length > 0 && otherUsers.length <= 10) {
      otherUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }

    // Check sequences
    const totalSequences = await prisma.sequence.count();
    console.log(`\n🔄 Total Sequences: ${totalSequences}`);

    // Check recent activities
    const recentActivities = await prisma.leadActivity.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
    console.log(`📝 Recent Activities (last 7 days): ${recentActivities}`);

    console.log('\n✅ DIAGNOSIS COMPLETE\n');

    if (totalLeads === 0) {
      console.log('⚠️  WARNING: No leads in database!');
      console.log('   This is why the dashboard shows zero leads.');
      console.log('   Solution: Create some test leads in the CRM.');
    }

    if (totalProposals === 0) {
      console.log('⚠️  WARNING: No proposals in database!');
      console.log('   This is why the dashboard shows zero proposals.');
      console.log('   Solution: Create some test proposals.');
    }

    const missingProfiles = employees.filter(e => !e.employeeProfile);
    if (missingProfiles.length > 0) {
      console.log('\n⚠️  WARNING: Some employees missing profiles:');
      missingProfiles.forEach(user => {
        console.log(`   - ${user.email}`);
      });
      console.log('   Run the fix-employee-access.ts script to fix this.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDashboardData();
