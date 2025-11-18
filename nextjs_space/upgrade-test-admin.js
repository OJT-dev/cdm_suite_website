require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upgradeUser() {
  try {
    const user = await prisma.user.update({
      where: { email: 'testadmin@cdmsuite.com' },
      data: {
        tier: 'starter',
      }
    });

    console.log('✅ Test admin upgraded to Starter tier');
    console.log('User:', user.email);
    console.log('Tier:', user.tier);
    console.log('Role:', user.role);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

upgradeUser();
