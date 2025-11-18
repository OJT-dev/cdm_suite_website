require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBlogImages() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true
      },
      orderBy: { publishedAt: 'desc' }
    });

    console.log('Total published posts:', posts.length);
    console.log('\n=== Blog Posts and Images ===\n');
    
    const imageMap = {};
    posts.forEach(post => {
      const img = post.featuredImage || 'NO IMAGE';
      if (!imageMap[img]) {
        imageMap[img] = [];
      }
      imageMap[img].push(post.title);
      
      console.log(`ID: ${post.id}`);
      console.log(`Title: ${post.title}`);
      console.log(`Slug: ${post.slug}`);
      console.log(`Image: ${img}`);
      console.log('---\n');
    });

    console.log('\n=== Duplicate Image Analysis ===\n');
    Object.keys(imageMap).forEach(img => {
      if (imageMap[img].length > 1) {
        console.log(`IMAGE: ${img}`);
        console.log(`Used by ${imageMap[img].length} posts:`);
        imageMap[img].forEach(title => console.log(`  - ${title}`));
        console.log('');
      }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBlogImages();
