
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'cdmsuitellc@gmail.com'
  const password = 'CDMSuite2025!' // Strong default password - should be changed after first login
  
  console.log('🔍 Checking if user exists...')
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { employeeProfile: true }
  })
  
  if (existingUser) {
    console.log('✅ User already exists, updating to admin with full privileges...')
    
    // Update existing user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'admin',
        tier: 'enterprise',
        credits: 999999999, // Unlimited credits
      }
    })
    
    // Ensure employee profile exists
    if (!existingUser.employeeProfile) {
      await prisma.employee.create({
        data: {
          userId: updatedUser.id,
          employeeRole: 'account_manager',
          department: 'development',
          capabilities: JSON.stringify({
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
          }),
        }
      })
      console.log('✅ Created employee profile')
    } else {
      await prisma.employee.update({
        where: { id: existingUser.employeeProfile.id },
        data: {
          capabilities: JSON.stringify({
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
          }),
        }
      })
      console.log('✅ Updated employee profile')
    }
    
    console.log('\n✅ Successfully updated user to admin:')
    console.log({
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      tier: updatedUser.tier,
      credits: updatedUser.credits,
    })
  } else {
    console.log('🆕 Creating new admin user...')
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create new admin user
    const newUser = await prisma.user.create({
      data: {
        email,
        name: 'CDM Suite LLC',
        password: hashedPassword,
        role: 'admin',
        tier: 'enterprise',
        credits: 999999999,
        emailVerified: new Date(),
      }
    })
    
    // Create employee profile
    await prisma.employee.create({
      data: {
        userId: newUser.id,
        employeeRole: 'account_manager',
        department: 'development',
        capabilities: JSON.stringify({
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
        }),
      }
    })
    
    console.log('\n✅ Successfully created admin user:')
    console.log({
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      tier: newUser.tier,
      credits: newUser.credits,
      password: password,
    })
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
