
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

async function fixDuplicateImages() {
  try {
    console.log('🔍 Analyzing blog post images...\n');
    
    // Get all blog posts (including drafts) with featured images
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
        publishedAt: 'asc'
      }
    });

    console.log(`Found ${posts.length} blog posts with theme images`);
    
    // Count usage of each image
    const imageUsage = new Map<string, string[]>();
    posts.forEach(post => {
      if (post.featuredImage) {
        if (!imageUsage.has(post.featuredImage)) {
          imageUsage.set(post.featuredImage, []);
        }
        imageUsage.get(post.featuredImage)!.push(post.title);
      }
    });

    // Find duplicates
    console.log('\n📊 Image usage statistics:');
    const duplicates: Array<{ image: string; titles: string[] }> = [];
    imageUsage.forEach((titles, image) => {
      console.log(`  ${image}: ${titles.length} post(s)`);
      if (titles.length > 1) {
        duplicates.push({ image, titles });
      }
    });

    if (duplicates.length === 0) {
      console.log('\n✅ No duplicate images found!');
      return;
    }

    console.log(`\n🔧 Found ${duplicates.length} duplicate image(s). Fixing...\n`);

    // Create a list of unused or underused images
    const usedImages = Array.from(imageUsage.keys());
    const availableImages = themeImages.filter(img => {
      const usage = imageUsage.get(img);
      return !usage || usage.length === 0;
    });

    console.log(`Available unused images: ${availableImages.length}`);

    // Fix duplicates by reassigning to unused images
    let imageIndex = 0;
    for (const duplicate of duplicates) {
      const postsToUpdate = posts.filter(p => p.featuredImage === duplicate.image);
      
      // Keep the first post with this image, reassign the others
      for (let i = 1; i < postsToUpdate.length; i++) {
        const post = postsToUpdate[i];
        const newImage = availableImages[imageIndex % availableImages.length];
        imageIndex++;
        
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { featuredImage: newImage }
        });
        
        console.log(`  ✓ Updated "${post.title.substring(0, 50)}..."`);
        console.log(`    From: ${duplicate.image} → To: ${newImage}`);
      }
    }

    console.log('\n✅ All duplicate images fixed!');
    console.log('\n📊 Final distribution:');
    
    // Get updated posts to show final distribution
    const updatedPosts = await prisma.blogPost.findMany({
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

    const finalUsage = new Map<string, number>();
    updatedPosts.forEach(post => {
      if (post.featuredImage) {
        finalUsage.set(post.featuredImage, (finalUsage.get(post.featuredImage) || 0) + 1);
      }
    });

    themeImages.forEach(img => {
      const count = finalUsage.get(img) || 0;
      console.log(`  ${img}: ${count} post(s)`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateImages();
