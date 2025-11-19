import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicateImages() {
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true
      },
      orderBy: {
        featuredImage: 'asc'
      }
    });

    // Group by image URL
    const imageMap = new Map<string, any[]>();
    
    for (const post of posts) {
      if (post.featuredImage) {
        if (!imageMap.has(post.featuredImage)) {
          imageMap.set(post.featuredImage, []);
        }
        imageMap.get(post.featuredImage)!.push(post);
      }
    }

    // Find duplicates
    console.log('DUPLICATE IMAGES FOUND:\n');
    let duplicateCount = 0;
    
    for (const [imageUrl, posts] of imageMap.entries()) {
      if (posts.length > 1) {
        duplicateCount++;
        console.log(`\n${duplicateCount}. Image: ${imageUrl}`);
        console.log(`   Used by ${posts.length} posts:`);
        posts.forEach((post, idx) => {
          console.log(`   ${idx + 1}. ${post.title} (slug: ${post.slug})`);
        });
      }
    }

    console.log(`\n\nTotal duplicate images: ${duplicateCount}`);
    console.log(`Total unique images: ${imageMap.size}`);
    console.log(`Total blog posts: ${posts.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicateImages();
