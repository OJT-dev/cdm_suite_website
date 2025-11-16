import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config({ path: '.env.local' });
config({ path: '.env' });

const prisma = new PrismaClient();

async function checkImageDistribution() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { id: true, title: true, featuredImage: true },
    });

    // Count usage of each theme image
    const imageUsage: { [key: string]: number } = {};
    posts.forEach(post => {
      if (post.featuredImage && post.featuredImage.includes('/blog-images/theme-')) {
        imageUsage[post.featuredImage] = (imageUsage[post.featuredImage] || 0) + 1;
      }
    });

    console.log('\nImage Distribution:');
    console.log('===================');
    Object.entries(imageUsage)
      .sort((a, b) => b[1] - a[1])
      .forEach(([image, count]) => {
        const filename = image.split('/').pop();
        console.log(`${filename}: ${count} posts`);
      });

    // Find posts with most commonly used images
    const sortedImages = Object.entries(imageUsage).sort((a, b) => b[1] - a[1]);
    if (sortedImages.length > 0) {
      const mostUsed = sortedImages[0];
      console.log(`\nMost used image: ${mostUsed[0].split('/').pop()} (${mostUsed[1]} times)`);
    }

    console.log(`\nTotal published posts: ${posts.length}`);
    console.log(`Total unique theme images: ${Object.keys(imageUsage).length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageDistribution();
