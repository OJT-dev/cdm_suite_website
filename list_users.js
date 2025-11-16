require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true
      }
    });
    
    console.log('All users in database:');
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
