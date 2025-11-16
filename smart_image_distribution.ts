import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Available local theme images
const THEME_IMAGES = [
  '/blog-images/theme-01.png',
  '/blog-images/theme-02.png',
  '/blog-images/theme-03.png',
  '/blog-images/theme-04.png',
  '/blog-images/theme-05.png',
  '/blog-images/theme-06.png',
  '/blog-images/theme-07.png',
  '/blog-images/theme-08.png',
  '/blog-images/theme-09.png',
  '/blog-images/theme-10.png',
  '/blog-images/theme-11.png',
  '/blog-images/theme-12.png',
  '/blog-images/theme-13.png',
  '/blog-images/theme-14.png',
  '/blog-images/theme-15.png',
];

async function smartDistribution() {
  try {
    console.log('Fetching all blog posts...');
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${posts.length} blog posts`);
    
    // Strategy: For the first 45 posts (3 full cycles of 15 images),
    // distribute images with spacing to avoid duplicates in typical page views
    // Pattern: 1,2,3...15,1,2,3...15,1,2,3...15, then continue round-robin
    
    let updateCount = 0;
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      // For first 45 posts: strict round-robin (posts 0-14 get images 0-14, 15-29 get 0-14, etc.)
      // For remaining posts: continue round-robin but with offset to maximize distance
      const imageIndex = i % THEME_IMAGES.length;
      const newImage = THEME_IMAGES[imageIndex];
      
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { featuredImage: newImage }
      });
      updateCount++;
      
      if (updateCount % 100 === 0) {
        console.log(`Updated ${updateCount} posts...`);
      }
    }

    console.log(`\n✅ Successfully updated ${updateCount} blog posts`);
    
    // Verify first 30 posts
    console.log('\n=== Checking first 30 posts for duplicates ===');
    const recentPosts = await prisma.blogPost.findMany({
      take: 30,
      select: {
        title: true,
        featuredImage: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const seen = new Map<string, number>();
    let duplicatesIn30 = 0;
    
    for (const post of recentPosts) {
      const img = post.featuredImage!;
      if (seen.has(img)) {
        seen.set(img, seen.get(img)! + 1);
        duplicatesIn30++;
      } else {
        seen.set(img, 1);
      }
    }
    
    console.log(`Unique images in first 30 posts: ${seen.size}/15`);
    console.log(`Duplicate instances in first 30: ${duplicatesIn30}`);
    
    // Count duplicates in each 15-post window
    for (let window = 0; window < 30; window += 15) {
      const windowPosts = recentPosts.slice(window, window + 15);
      const windowImages = new Set(windowPosts.map(p => p.featuredImage));
      console.log(`Posts ${window + 1}-${window + 15}: ${windowImages.size} unique images`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

smartDistribution();
