import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config({ path: '.env.local' });
config({ path: '.env' });

const prisma = new PrismaClient();

async function checkSlugs() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        OR: [
          { slug: { contains: 'target' } },
          { slug: { contains: '=' } },
          { slug: { startsWith: 'target' } }
        ]
      },
      select: { id: true, title: true, slug: true, status: true },
    });

    if (posts.length > 0) {
      console.log(`Found ${posts.length} posts with unusual slugs:`);
      posts.forEach(post => {
        console.log(`- ${post.title} (${post.slug}) [${post.status}]`);
      });
    } else {
      console.log('No posts found with "target" or "=" in slug');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSlugs();
