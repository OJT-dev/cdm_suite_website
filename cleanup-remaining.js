
const { PrismaClient } = require('/home/ubuntu/cdm_suite_website/nextjs_space/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function cleanupRemaining() {
  try {
    console.log('🧹 Cleaning up remaining duplicates...\n');
    
    // Delete specific duplicate slugs
    const slugsToDelete = [
      'seo-seo-comprehensive', // Duplicate of seo-comprehensive
      'seo-seo-growth', // Duplicate of seo-growth
      'seo-seo-local-basic', // Duplicate of seo-local-basic
      'website-creation-business', // Duplicate of website-creation-growth
    ];
    
    for (const slug of slugsToDelete) {
      const service = await prisma.service.findUnique({
        where: { slug }
      });
      
      if (service) {
        console.log(`❌ Deleting: ${service.name} (${slug})`);
        await prisma.service.delete({
          where: { slug }
        });
      }
    }
    
    // Verify final count
    const remainingServices = await prisma.service.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`\n✅ Cleanup complete! ${remainingServices.length} unique services remaining.\n`);
    console.log('Final services:');
    
    const byCategory = {};
    remainingServices.forEach(s => {
      let category = 'Other';
      if (s.slug.includes('website-maintenance')) category = 'Website Maintenance';
      else if (s.slug.includes('website-creation')) category = 'Website Creation';
      else if (s.slug.includes('seo')) category = 'SEO';
      else if (s.slug.includes('social-media')) category = 'Social Media';
      else if (s.slug.includes('ad-management')) category = 'Ad Management';
      else if (s.slug.includes('app-creation')) category = 'App Creation';
      else if (s.slug.includes('app-maintenance')) category = 'App Maintenance';
      else if (s.slug.includes('bundle')) category = 'Bundle Packages';
      
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push(s);
    });
    
    Object.keys(byCategory).sort().forEach(cat => {
      console.log(`\n${cat}:`);
      byCategory[cat].forEach((s, i) => {
        console.log(`   ${i+1}. ${s.name} - $${s.price}`);
      });
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

cleanupRemaining();
