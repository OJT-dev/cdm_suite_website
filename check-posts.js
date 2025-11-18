
require('dotenv').config({ path: '/home/ubuntu/cdm_suite_website/nextjs_space/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPosts() {
  const posts = await prisma.blogPost.findMany({
    take: 3,
    orderBy: { publishedAt: 'desc' },
    select: {
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      featuredImage: true,
      categories: true,
    }
  });
  
  console.log('Sample posts:');
  posts.forEach((post, idx) => {
    console.log(`\n--- Post ${idx + 1} ---`);
    console.log('Title:', post.title);
    console.log('Slug:', post.slug);
    console.log('Has featured image:', !!post.featuredImage);
    console.log('Content length:', post.content.length);
    console.log('Content preview:', post.content.substring(0, 300));
    console.log('Categories:', post.categories);
  });
  
  await prisma.$disconnect();
}

checkPosts().catch(console.error);
