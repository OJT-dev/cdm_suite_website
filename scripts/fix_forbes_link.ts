import { config } from 'dotenv';
config();

import { prisma } from '../lib/db';

async function main() {
  // Find posts with forbes.com link
  const posts = await prisma.blogPost.findMany({
    where: {
      OR: [
        { content: { contains: 'forbes.com' } },
        { excerpt: { contains: 'forbes.com' } }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true
    }
  });
  
  console.log(`Found ${posts.length} posts with forbes.com link`);
  
  // Update posts to remove the broken link
  for (const post of posts) {
    const updatedContent = post.content.replace(/https?:\/\/www\.forbes\.com\/sites\/forbesagencycouncil\/2021\/03\/24\/the-importance-of-brand-perception\//g, '#');
    const updatedExcerpt = post.excerpt?.replace(/https?:\/\/www\.forbes\.com\/sites\/forbesagencycouncil\/2021\/03\/24\/the-importance-of-brand-perception\//g, '#') || post.excerpt;
    
    await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        content: updatedContent,
        excerpt: updatedExcerpt
      }
    });
    
    console.log(`Updated post: ${post.title}`);
  }
  
  console.log('Done!');
  await prisma.$disconnect();
}

main().catch(console.error);
