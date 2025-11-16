require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyVariety() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      featuredImage: true,
    }
  });

  console.log('Checking for consecutive duplicates...\n');
  
  let consecutiveDuplicates = 0;
  let previousImage = null;
  
  for (let i = 0; i < Math.min(20, posts.length); i++) {
    const post = posts[i];
    const imgName = post.featuredImage ? post.featuredImage.split('/').pop().substring(0, 8) : 'NONE';
    const isDuplicate = post.featuredImage === previousImage;
    
    console.log(`${i + 1}. ${post.title.substring(0, 50)}...`);
    console.log(`   Image: ${imgName}${isDuplicate ? ' ⚠️ DUPLICATE!' : ' ✅'}`);
    
    if (isDuplicate) {
      consecutiveDuplicates++;
    }
    
    previousImage = post.featuredImage;
  }
  
  console.log(`\n${'='.repeat(60)}`);
  if (consecutiveDuplicates === 0) {
    console.log('✅ SUCCESS: No consecutive duplicates found!');
  } else {
    console.log(`⚠️ Found ${consecutiveDuplicates} consecutive duplicates`);
  }
}

verifyVariety()
  .then(() => {
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error('Error:', error);
    prisma.$disconnect();
  });
