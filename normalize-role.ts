import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update the test admin role to lowercase
  const result = await prisma.user.update({
    where: { email: 'testadmin@cdmsuite.com' },
    data: { role: 'admin' }
  });
  
  console.log('Updated test admin role:', result.email, '→', result.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
