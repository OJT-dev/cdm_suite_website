import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMalformedSlug() {
  try {
    // Find posts with malformed slugs
    const posts = await prisma.blogPost.findMany({
      where: {
        OR: [
          { slug: { contains: 'target=' } },
          { slug: { contains: '=' } },
          { slug: { contains: ' ' } }
        ]
      }
    });

    console.log(`Found ${posts.length} posts with malformed slugs`);

    for (const post of posts) {
      console.log(`\nMalformed slug: "${post.slug}"`);
      console.log(`Title: "${post.title}"`);
      
      // Generate proper slug from title
      const properSlug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      console.log(`Proposed new slug: "${properSlug}"`);
      
      // Check if new slug already exists
      const existing = await prisma.blogPost.findFirst({
        where: {
          slug: properSlug,
          id: { not: post.id }
        }
      });
      
      if (existing) {
        console.log(`Slug "${properSlug}" already exists, adding suffix`);
        const finalSlug = `${properSlug}-${post.id}`;
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { slug: finalSlug }
        });
        console.log(`✓ Updated to: "${finalSlug}"`);
      } else {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { slug: properSlug }
        });
        console.log(`✓ Updated to: "${properSlug}"`);
      }
    }

    console.log('\n✓ All malformed slugs fixed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMalformedSlug();
