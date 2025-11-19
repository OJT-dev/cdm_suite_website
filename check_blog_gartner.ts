import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGartnerLinks() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        OR: [
          { content: { contains: 'gartner' } },
          { content: { contains: 'Gartner' } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true
      }
    });

    console.log(`Found ${posts.length} blog posts with Gartner links`);
    
    for (const post of posts) {
      const matches = post.content.match(/https?:\/\/[^\s\)]+gartner[^\s\)]*/gi) || [];
      if (matches.length > 0) {
        console.log(`\nPost: ${post.title}`);
        console.log(`Slug: ${post.slug}`);
        console.log(`Links found:`, matches);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGartnerLinks();
