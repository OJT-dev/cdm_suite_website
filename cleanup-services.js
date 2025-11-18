
const { PrismaClient } = require('/home/ubuntu/cdm_suite_website/nextjs_space/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function cleanupServices() {
  try {
    console.log('🧹 Starting database cleanup...\n');
    
    // Get all services
    const services = await prisma.service.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`Found ${services.length} total services\n`);
    
    // Group by name to find duplicates
    const servicesByName = {};
    services.forEach(service => {
      if (!servicesByName[service.name]) {
        servicesByName[service.name] = [];
      }
      servicesByName[service.name].push(service);
    });
    
    let duplicateCount = 0;
    let keepCount = 0;
    const servicesToDelete = [];
    
    // For each group of services with the same name
    for (const [name, group] of Object.entries(servicesByName)) {
      if (group.length > 1) {
        console.log(`\n📋 Found ${group.length} duplicates of: ${name}`);
        duplicateCount += group.length - 1;
        
        // Sort by slug length (prefer shorter slugs) and then alphabetically
        group.sort((a, b) => {
          const lengthDiff = a.slug.length - b.slug.length;
          if (lengthDiff !== 0) return lengthDiff;
          return a.slug.localeCompare(b.slug);
        });
        
        // Keep the first one (shortest/simplest slug)
        const keep = group[0];
        const deleteList = group.slice(1);
        
        console.log(`   ✓ Keeping: ${keep.slug}`);
        deleteList.forEach(s => {
          console.log(`   ✗ Deleting: ${s.slug}`);
          servicesToDelete.push(s.id);
        });
        
        keepCount++;
      } else {
        keepCount++;
      }
    }
    
    console.log(`\n\n📊 Summary:`);
    console.log(`   Total services: ${services.length}`);
    console.log(`   Unique services to keep: ${keepCount}`);
    console.log(`   Duplicates to delete: ${servicesToDelete.length}`);
    
    if (servicesToDelete.length > 0) {
      console.log(`\n🗑️  Deleting ${servicesToDelete.length} duplicate services...`);
      
      const result = await prisma.service.deleteMany({
        where: {
          id: {
            in: servicesToDelete
          }
        }
      });
      
      console.log(`✅ Deleted ${result.count} duplicate services`);
    }
    
    // Verify cleanup
    const remainingServices = await prisma.service.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`\n✨ Cleanup complete! ${remainingServices.length} unique services remaining.\n`);
    console.log('Remaining services:');
    remainingServices.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.name} (${s.slug}) - $${s.price}`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

cleanupServices();
