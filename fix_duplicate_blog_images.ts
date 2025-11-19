import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Available local theme images
const THEME_IMAGES = [
  '/blog-images/theme-01.png',
  '/blog-images/theme-02.png',
  '/blog-images/theme-03.png',
  '/blog-images/theme-04.png',
  '/blog-images/theme-05.png',
  '/blog-images/theme-06.png',
  '/blog-images/theme-07.png',
  '/blog-images/theme-08.png',
  '/blog-images/theme-09.png',
  '/blog-images/theme-10.png',
  '/blog-images/theme-11.png',
  '/blog-images/theme-12.png',
  '/blog-images/theme-13.png',
  '/blog-images/theme-14.png',
  '/blog-images/theme-15.png',
];

async function redistributeImages() {
  try {
    console.log('Fetching all blog posts...');
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc' // Most recent first
      }
    });

    console.log(`Found ${posts.length} blog posts`);
    console.log(`Available theme images: ${THEME_IMAGES.length}`);
    
    let updateCount = 0;
    
    // Assign images in a round-robin fashion to ensure even distribution
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const newImage = THEME_IMAGES[i % THEME_IMAGES.length];
      
      // Only update if the image is different
      if (post.featuredImage !== newImage) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { featuredImage: newImage }
        });
        updateCount++;
        
        if (updateCount % 50 === 0) {
          console.log(`Updated ${updateCount} posts...`);
        }
      }
    }

    console.log(`\n✅ Successfully updated ${updateCount} blog posts with redistributed images`);
    console.log(`Distribution: ~${Math.ceil(posts.length / THEME_IMAGES.length)} posts per image`);
    
    // Verify no duplicates on first page (typically shows ~12 posts)
    const recentPosts = await prisma.blogPost.findMany({
      take: 12,
      select: {
        title: true,
        featuredImage: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const imageSet = new Set(recentPosts.map(p => p.featuredImage));
    console.log(`\nFirst 12 posts on blog page: ${imageSet.size} unique images (should be 12)`);
    
    if (imageSet.size === 12) {
      console.log('✅ No duplicates on blog homepage!');
    } else {
      console.log('⚠️ Some duplicates still present on homepage');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

redistributeImages();
