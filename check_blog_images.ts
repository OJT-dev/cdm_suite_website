
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

const prisma = new PrismaClient();

async function checkImages() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true
      },
      take: 10
    });

    console.log('Sample blog posts:');
    posts.forEach(post => {
      console.log(`\nTitle: ${post.title.substring(0, 60)}`);
      console.log(`Image: ${post.featuredImage}`);
    });

    // Count image usage
    const allPosts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        featuredImage: { not: null }
      },
      select: {
        featuredImage: true,
        title: true
      }
    });

    const imageCount = new Map<string, string[]>();
    allPosts.forEach(post => {
      if (post.featuredImage) {
        if (!imageCount.has(post.featuredImage)) {
          imageCount.set(post.featuredImage, []);
        }
        imageCount.get(post.featuredImage)!.push(post.title);
      }
    });

    console.log('\n\nImage usage:');
    const sorted = Array.from(imageCount.entries()).sort((a, b) => b[1].length - a[1].length);
    sorted.forEach(([image, titles]) => {
      if (titles.length > 1) {
        console.log(`\n${image}: ${titles.length} posts`);
        titles.forEach((title, idx) => {
          console.log(`  ${idx + 1}. ${title.substring(0, 60)}`);
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
