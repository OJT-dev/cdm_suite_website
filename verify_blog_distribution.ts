import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDistribution() {
  try {
    // Get the first 20 most recent posts (blog page typically shows 12-15)
    const recentPosts = await prisma.blogPost.findMany({
      take: 20,
      select: {
        title: true,
        slug: true,
        featuredImage: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Most Recent 20 Blog Posts:\n');
    
    const imageCount = new Map<string, string[]>();
    
    recentPosts.forEach((post, idx) => {
      console.log(`${idx + 1}. ${post.title}`);
      console.log(`   Image: ${post.featuredImage}`);
      console.log(`   Slug: ${post.slug}\n`);
      
      if (!imageCount.has(post.featuredImage!)) {
        imageCount.set(post.featuredImage!, []);
      }
      imageCount.get(post.featuredImage!)!.push(post.title);
    });

    console.log('\n=== DUPLICATE CHECK ===');
    let duplicatesFound = false;
    
    for (const [image, posts] of imageCount.entries()) {
      if (posts.length > 1) {
        duplicatesFound = true;
        console.log(`\n⚠️ Image ${image} used by ${posts.length} posts:`);
        posts.forEach((title, idx) => {
          console.log(`   ${idx + 1}. ${title}`);
        });
      }
    }

    if (!duplicatesFound) {
      console.log('\n✅ No duplicates found in the first 20 posts!');
    } else {
      console.log('\n❌ Duplicates detected - need to fix distribution');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDistribution();
