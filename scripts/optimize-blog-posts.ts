
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { generateStructuredData, calculateReadTime, generateMetaDescription } from '../lib/blog-seo';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function optimizeBlogPosts() {
  console.log('Starting blog post optimization...\n');

  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
      },
    });

    console.log(`Found ${posts.length} published posts to optimize\n`);

    let updated = 0;

    for (const post of posts) {
      try {
        // Calculate read time
        const readTime = calculateReadTime(post.content);

        // Generate meta description if missing
        const metaDescription = post.metaDescription || generateMetaDescription(post);

        // Generate structured data
        const structuredData = generateStructuredData({
          ...post,
          readTime,
          metaDescription,
        });

        // Update post
        await prisma.blogPost.update({
          where: { id: post.id },
          data: {
            readTime,
            metaDescription,
            structuredData: JSON.stringify(structuredData),
          },
        });

        updated++;

        if (updated % 50 === 0) {
          console.log(`Optimized ${updated} posts...`);
        }
      } catch (error: any) {
        console.error(`Error optimizing post "${post.title}":`, error.message);
      }
    }

    console.log(`\n✅ Successfully optimized ${updated} blog posts!`);
    console.log('\nOptimizations applied:');
    console.log('- Calculated read time');
    console.log('- Generated meta descriptions');
    console.log('- Added JSON-LD structured data');
    console.log('- SEO-ready for 2025 standards');

  } catch (error) {
    console.error('Error during optimization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the optimization
optimizeBlogPosts();
