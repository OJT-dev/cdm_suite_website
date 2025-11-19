require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestAdmin() {
  try {
    // Check if test admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'testadmin@cdmsuite.com' }
    });

    if (existing) {
      console.log('Test admin account already exists');
      console.log('Email: testadmin@cdmsuite.com');
      console.log('Password: TestAdmin123!');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('TestAdmin123!', 10);

    // Create test admin user
    const user = await prisma.user.create({
      data: {
        email: 'testadmin@cdmsuite.com',
        password: hashedPassword,
        name: 'Test Administrator',
        role: 'ADMIN',
        emailVerified: new Date()
      }
    });

    console.log('✅ Test admin account created successfully!');
    console.log('Email: testadmin@cdmsuite.com');
    console.log('Password: TestAdmin123!');
    console.log('Role:', user.role);
    console.log('User ID:', user.id);

  } catch (error) {
    console.error('Error creating test admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();
