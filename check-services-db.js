require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkServices() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        sortOrder: true,
      },
    });

    console.log('Total services:', services.length);
    console.log('\nServices:');
    services.forEach((service, index) => {
      console.log(`${index + 1}. [${service.sortOrder}] ${service.slug} - ${service.name}`);
    });

    // Check for duplicate slugs
    const slugCount = {};
    services.forEach(service => {
      slugCount[service.slug] = (slugCount[service.slug] || 0) + 1;
    });

    const duplicates = Object.entries(slugCount).filter(([slug, count]) => count > 1);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  DUPLICATE SLUGS FOUND:');
      duplicates.forEach(([slug, count]) => {
        console.log(`   ${slug}: ${count} times`);
      });
    } else {
      console.log('\n✅ No duplicate slugs found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();
