require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUser() {
  try {
    // Update to starter tier with Stripe info
    const updated = await prisma.user.update({
      where: { email: 'fooholness@gmail.com' },
      data: { 
        tier: 'starter',
        stripeSubscriptionId: 'sub_1RZEPhCeWvLpNOQv',
        stripeCustomerId: 'cus_TDYZah3VDU5CIU'
      }
    });
    
    console.log('✅ Account upgraded successfully!');
    console.log('Email:', updated.email);
    console.log('New tier:', updated.tier);
    console.log('Subscription ID:', updated.stripeSubscriptionId);
    console.log('Customer ID:', updated.stripeCustomerId);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateUser();
