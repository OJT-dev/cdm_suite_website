import { config } from 'dotenv';
config({ path: ['.env.local', '.env'] });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'testbuilder@example.com' },
    data: { tier: 'starter', credits: 1000 }
  });
  console.log('Updated user:', user.email, 'to tier:', user.tier, 'credits:', user.credits);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
