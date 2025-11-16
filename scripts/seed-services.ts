
import { PrismaClient } from '@prisma/client';
import {
  AD_MANAGEMENT_TIERS,
  SEO_TIERS,
  SOCIAL_MEDIA_TIERS,
  WEB_DEVELOPMENT_TIERS,
  APP_CREATION_TIERS,
  WEBSITE_MAINTENANCE_TIERS,
  APP_MAINTENANCE_TIERS,
} from '../lib/pricing-tiers';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding services from pricing tiers...');

  let sortOrder = 1;

  // Website Maintenance Services
  for (const tier of WEBSITE_MAINTENANCE_TIERS) {
    await prisma.service.upsert({
      where: { slug: `website-maintenance-${tier.id}` },
      update: {
        name: `Website Maintenance - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
      create: {
        slug: `website-maintenance-${tier.id}`,
        name: `Website Maintenance - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
    });
    sortOrder++;
  }

  // Website Creation/Development Services
  for (const tier of WEB_DEVELOPMENT_TIERS) {
    await prisma.service.upsert({
      where: { slug: `website-creation-${tier.id}` },
      update: {
        name: `Website Creation - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
      create: {
        slug: `website-creation-${tier.id}`,
        name: `Website Creation - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
    });
    sortOrder++;
  }

  // SEO Services
  for (const tier of SEO_TIERS) {
    await prisma.service.upsert({
      where: { slug: `seo-${tier.id}` },
      update: {
        name: `SEO - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
      create: {
        slug: `seo-${tier.id}`,
        name: `SEO - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
    });
    sortOrder++;
  }

  // Social Media Services
  for (const tier of SOCIAL_MEDIA_TIERS) {
    await prisma.service.upsert({
      where: { slug: `social-media-${tier.id}` },
      update: {
        name: `Social Media - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
      create: {
        slug: `social-media-${tier.id}`,
        name: `Social Media - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
    });
    sortOrder++;
  }

  // Ad Management Services
  for (const tier of AD_MANAGEMENT_TIERS) {
    await prisma.service.upsert({
      where: { slug: `ad-management-${tier.id}` },
      update: {
        name: `Ad Management - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
      create: {
        slug: `ad-management-${tier.id}`,
        name: `Ad Management - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
    });
    sortOrder++;
  }

  // App Creation Services
  for (const tier of APP_CREATION_TIERS) {
    await prisma.service.upsert({
      where: { slug: `app-creation-${tier.id}` },
      update: {
        name: `App Creation - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
      create: {
        slug: `app-creation-${tier.id}`,
        name: `App Creation - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
    });
    sortOrder++;
  }

  // App Maintenance Services
  for (const tier of APP_MAINTENANCE_TIERS) {
    await prisma.service.upsert({
      where: { slug: `app-maintenance-${tier.id}` },
      update: {
        name: `App Maintenance - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
      create: {
        slug: `app-maintenance-${tier.id}`,
        name: `App Maintenance - ${tier.name}`,
        price: tier.price,
        description: tier.description,
        features: tier.features,
        popular: tier.popular,
        sortOrder,
        active: true,
      },
    });
    sortOrder++;
  }

  console.log('✅ All services seeded successfully from pricing tiers!');
  console.log(`   Total services: ${sortOrder - 1}`);
}

main()
  .catch((e) => {
    console.error('Error seeding services:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
