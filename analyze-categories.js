require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeCategories() {
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

    // Simulate the categorization logic from the page
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
      if (service.slug.includes('website-creation') || service.slug.includes('web-')) {
        categories['website-creation'].push(service);
      } else if (service.slug.includes('website-maintenance') || service.slug.includes('maintenance-')) {
        categories['website-maintenance'].push(service);
      } else if (service.slug.includes('seo-')) {
        categories['seo'].push(service);
      } else if (service.slug.includes('social-')) {
        categories['social-media'].push(service);
      } else if (service.slug.includes('ad-')) {
        categories['ad-management'].push(service);
      } else if (service.slug.includes('app-') && !service.slug.includes('maintenance')) {
        categories['app-creation'].push(service);
      } else if (service.slug.includes('app-maintenance')) {
        categories['app-maintenance'].push(service);
      } else if (service.slug.includes('bundle')) {
        categories['bundle'].push(service);
      }
    });

    console.log('\n=== CATEGORY ANALYSIS ===\n');
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

analyzeCategories();
