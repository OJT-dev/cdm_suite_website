require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'testadmin@cdmsuite.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true
      }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User details:');
    console.log(JSON.stringify(user, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
