import { prisma } from '../lib/db';

async function fixBlogCTALinks() {
  try {
    // Find all posts with /audit links
    const posts = await prisma.blogPost.findMany({
      where: {
        content: {
          contains: '/audit',
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
      },
    });

    console.log(`Found ${posts.length} post(s) with /audit links\n`);

    for (const post of posts) {
      // Replace all /audit links with /marketing-assessment
      const updatedContent = post.content.replace(/\/audit/g, '/marketing-assessment');
      
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { content: updatedContent },
      });

      console.log(`✓ Updated: ${post.title}`);
      console.log(`  Slug: ${post.slug}\n`);
    }

    console.log(`\nAll blog posts updated successfully!`);
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixBlogCTALinks();
