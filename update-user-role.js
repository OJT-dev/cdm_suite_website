require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    // Update everoythomas@gmail.com to admin
    const user = await prisma.user.update({
      where: { email: 'everoythomas@gmail.com' },
      data: { role: 'admin' },
    });
    
    console.log('✅ User updated successfully:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
