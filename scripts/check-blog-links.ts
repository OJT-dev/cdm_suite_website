import { prisma } from '../lib/db';

async function checkBlogLinks() {
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
      },
    });

    console.log(`Total posts: ${posts.length}\n`);

    posts.forEach((post: any) => {
      const hasAuditLink = post.content.includes('/audit');
      const hasMarketingAssessment = post.content.includes('/marketing-assessment');
      
      if (hasAuditLink || hasMarketingAssessment) {
        console.log(`\nPost: ${post.title}`);
        console.log(`Slug: ${post.slug}`);
        console.log(`Has /audit link: ${hasAuditLink}`);
        console.log(`Has /marketing-assessment link: ${hasMarketingAssessment}`);
      }
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkBlogLinks();
