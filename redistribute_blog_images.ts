
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

const prisma = new PrismaClient();

// Available theme images (15 total)
const themeImages = [
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

async function redistributeImages() {
  try {
    console.log('🔍 Fetching all blog posts...\n');
    
    // Get all blog posts with theme images
    const posts = await prisma.blogPost.findMany({
      where: {
        featuredImage: {
          not: null,
          startsWith: '/blog-images/theme-'
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true
      },
      orderBy: {
        createdAt: 'asc' // Distribute based on creation order
      }
    });

    console.log(`Found ${posts.length} blog posts`);
    console.log(`Target: ~${Math.floor(posts.length / themeImages.length)} posts per image\n`);

    // Redistribute images evenly
    console.log('📊 Redistributing images evenly...\n');
    
    let imageIndex = 0;
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const targetImage = themeImages[imageIndex];
      
      // Only update if the current image is different
      if (post.featuredImage !== targetImage) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { featuredImage: targetImage }
        });
        
        if (i % 50 === 0) {
          console.log(`  Progress: ${i}/${posts.length} posts updated...`);
        }
      }
      
      // Move to next image, cycle back to start
      imageIndex = (imageIndex + 1) % themeImages.length;
    }

    console.log(`\n✅ All images redistributed!\n`);
    
    // Show final distribution
    console.log('📊 Final distribution:');
    const finalPosts = await prisma.blogPost.findMany({
      where: {
        featuredImage: {
          not: null,
          startsWith: '/blog-images/theme-'
        }
      },
      select: {
        featuredImage: true
      }
    });

    const distribution = new Map<string, number>();
    finalPosts.forEach(post => {
      if (post.featuredImage) {
        distribution.set(post.featuredImage, (distribution.get(post.featuredImage) || 0) + 1);
      }
    });

    themeImages.forEach(img => {
      const count = distribution.get(img) || 0;
      console.log(`  ${img}: ${count} post(s)`);
    });

    // Calculate standard deviation to show evenness
    const counts = themeImages.map(img => distribution.get(img) || 0);
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);
    
    console.log(`\n📈 Average posts per image: ${avg.toFixed(1)}`);
    console.log(`📉 Standard deviation: ${stdDev.toFixed(2)} (lower is more even)`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

redistributeImages();
