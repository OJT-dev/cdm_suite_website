import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Update the account to admin
  const result = await prisma.user.update({
    where: {
      email: 'fooholness@gmail.com'
    },
    data: {
      role: 'admin'
    }
  })
  
  console.log('✅ Successfully updated account to admin role:')
  console.log({
    email: result.email,
    name: result.name,
    role: result.role
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
