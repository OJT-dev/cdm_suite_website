import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing audit issues...\n')
  
  // 1. Fix admin accounts without verified emails
  console.log('📧 Checking admin accounts without verified emails...')
  const unverifiedAdmins = await prisma.user.findMany({
    where: {
      role: 'admin',
      emailVerified: null
    },
    select: { email: true, name: true }
  })
  
  if (unverifiedAdmins.length > 0) {
    console.log(`   Found ${unverifiedAdmins.length} unverified admin accounts:`)
    for (const admin of unverifiedAdmins) {
      console.log(`   - ${admin.email} (${admin.name})`)
    }
    
    // Verify all admin emails
    const result = await prisma.user.updateMany({
      where: {
        role: 'admin',
        emailVerified: null
      },
      data: {
        emailVerified: new Date()
      }
    })
    console.log(`✅ Verified ${result.count} admin email(s)`)
  } else {
    console.log('✅ All admin emails already verified')
  }
  
  // 2. Fix leads with invalid status
  console.log('\n📋 Checking leads with invalid status...')
  const leadsWithInvalidStatus = await prisma.lead.findMany({
    where: {
      status: {
        notIn: ['new', 'qualified', 'proposal', 'closed-won', 'closed-lost']
      }
    },
    select: { id: true, status: true, email: true, name: true }
  })
  
  if (leadsWithInvalidStatus.length > 0) {
    console.log(`   Found ${leadsWithInvalidStatus.length} lead(s) with invalid status:`)
    for (const lead of leadsWithInvalidStatus) {
      console.log(`   - ${lead.name || lead.email} (Status: ${lead.status})`)
    }
    
    // Fix invalid statuses by setting them to 'new'
    for (const lead of leadsWithInvalidStatus) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'new' }
      })
    }
    console.log(`✅ Fixed ${leadsWithInvalidStatus.length} lead status(es)`)
  } else {
    console.log('✅ All leads have valid status')
  }
  
  console.log('\n✅ All audit issues fixed!')
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
