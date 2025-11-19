
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check all admin users
  const admins = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'ADMIN' },
        { role: 'admin' }
      ]
    },
    include: {
      employeeProfile: true
    }
  });
  
  console.log('Admin accounts:', JSON.stringify(admins, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
