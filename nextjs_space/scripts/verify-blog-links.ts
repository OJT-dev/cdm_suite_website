import { prisma } from '../lib/db';

async function verifyBlogLinks() {
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

    const auditPosts = posts.filter((p: any) => p.content.includes('/audit'));
    const assessmentPosts = posts.filter((p: any) => p.content.includes('/marketing-assessment'));

    console.log(`Posts with /audit link: ${auditPosts.length}`);
    console.log(`Posts with /marketing-assessment link: ${assessmentPosts.length}\n`);

    if (auditPosts.length > 0) {
      console.log('Posts still using /audit:');
      auditPosts.forEach((post: any) => {
        console.log(`  - ${post.title} (${post.slug})`);
      });
    }

    if (assessmentPosts.length > 0) {
      console.log('\nPosts using /marketing-assessment:');
      assessmentPosts.slice(0, 5).forEach((post: any) => {
        console.log(`  ✓ ${post.title} (${post.slug})`);
      });
      if (assessmentPosts.length > 5) {
        console.log(`  ... and ${assessmentPosts.length - 5} more`);
      }
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

verifyBlogLinks();
