require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNewCategorization() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    // New categorization logic with startsWith instead of includes
    const categories = {
      'website-creation': [],
      'website-maintenance': [],
      'seo': [],
      'social-media': [],
      'ad-management': [],
      'app-creation': [],
      'app-maintenance': [],
      'bundle': [],
    };

    services.forEach(service => {
      // Check more specific patterns first to avoid miscategorization
      if (service.slug.startsWith('website-creation')) {
        categories['website-creation'].push(service);
      } else if (service.slug.startsWith('website-maintenance')) {
        categories['website-maintenance'].push(service);
      } else if (service.slug.startsWith('app-maintenance')) {
        categories['app-maintenance'].push(service);
      } else if (service.slug.startsWith('app-')) {
        categories['app-creation'].push(service);
      } else if (service.slug.startsWith('seo-')) {
        categories['seo'].push(service);
      } else if (service.slug.startsWith('social-')) {
        categories['social-media'].push(service);
      } else if (service.slug.startsWith('ad-')) {
        categories['ad-management'].push(service);
      } else if (service.slug.startsWith('bundle')) {
        categories['bundle'].push(service);
      }
    });

    console.log('\n=== NEW CATEGORIZATION (FIXED) ===\n');
    Object.entries(categories).forEach(([category, items]) => {
      if (items.length > 0) {
        console.log(`\n${category.toUpperCase()} (${items.length} items):`);
        items.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.slug} - ${item.name}`);
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewCategorization();
