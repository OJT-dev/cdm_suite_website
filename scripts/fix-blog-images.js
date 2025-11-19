
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Track which images have been used
const usedImages = new Set();

// Helper function to generate a deterministic unique image URL based on post title and categories
function generateUniqueImageUrl(title, categories, id) {
  // Extract key themes from title and categories for image generation
  const keywords = [title, ...categories].join(' ').toLowerCase();
  
  // Determine image theme based on keywords
  let theme = 'digital-marketing';
  let description = 'modern digital marketing dashboard with analytics and data visualization';
  
  if (keywords.includes('seo') || keywords.includes('search')) {
    theme = 'seo';
    description = 'search engine optimization concept with keywords, rankings, and analytics charts';
  } else if (keywords.includes('social') || keywords.includes('facebook') || keywords.includes('instagram')) {
    theme = 'social-media';
    description = 'social media marketing with engagement metrics and content strategy';
  } else if (keywords.includes('data') || keywords.includes('analytics')) {
    theme = 'data-analytics';
    description = 'business analytics dashboard with graphs, charts, and data insights';
  } else if (keywords.includes('web') || keywords.includes('design') || keywords.includes('website')) {
    theme = 'web-design';
    description = 'modern website design with responsive layout and user interface elements';
  } else if (keywords.includes('email') || keywords.includes('automation')) {
    theme = 'automation';
    description = 'marketing automation workflow with email campaigns and customer journey';
  } else if (keywords.includes('content') || keywords.includes('blog')) {
    theme = 'content';
    description = 'content creation and strategy with writing, publishing, and distribution';
  } else if (keywords.includes('brand') || keywords.includes('logo')) {
    theme = 'branding';
    description = 'brand identity development with logo design and visual elements';
  } else if (keywords.includes('roi') || keywords.includes('revenue') || keywords.includes('growth')) {
    theme = 'growth';
    description = 'business growth metrics with revenue charts and performance indicators';
  } else if (keywords.includes('ai') || keywords.includes('machine learning')) {
    theme = 'ai';
    description = 'artificial intelligence and machine learning in marketing technology';
  } else if (keywords.includes('google ads') || keywords.includes('ppc')) {
    theme = 'paid-ads';
    description = 'paid advertising campaign with Google Ads dashboard and metrics';
  } else if (keywords.includes('ecommerce') || keywords.includes('shopify')) {
    theme = 'ecommerce';
    description = 'ecommerce platform with shopping cart and product management';
  } else if (keywords.includes('b2b')) {
    theme = 'b2b';
    description = 'B2B marketing strategy with lead generation and sales funnel';
  } else if (keywords.includes('startup')) {
    theme = 'startup';
    description = 'startup marketing strategy with growth hacking and lean methodology';
  }
  
  // Create a unique image identifier
  const uniqueId = Buffer.from(`${id}-${theme}-${Date.now()}`).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  
  return {
    description,
    theme,
    uniqueId
  };
}

async function fixBlogImages() {
  console.log('🔍 Finding blog posts with duplicate images...\n');
  
  const posts = await prisma.blogPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' }
  });

  // Group posts by image
  const imageMap = {};
  posts.forEach(post => {
    const img = post.featuredImage || 'NO_IMAGE';
    if (!imageMap[img]) {
      imageMap[img] = [];
    }
    imageMap[img].push(post);
  });

  // Find duplicates
  const duplicateImages = Object.entries(imageMap).filter(([img, posts]) => posts.length > 1 && img !== 'NO_IMAGE');
  
  console.log(`Found ${duplicateImages.length} duplicate images affecting ${duplicateImages.reduce((sum, [, posts]) => sum + posts.length, 0)} posts\n`);
  
  // For each duplicate image, generate unique images
  const imagesToGenerate = [];
  
  for (const [duplicateImg, duplicatePosts] of duplicateImages) {
    console.log(`\n📸 Processing ${duplicatePosts.length} posts using ${duplicateImg.substring(duplicateImg.lastIndexOf('/') + 1)}`);
    
    for (const post of duplicatePosts) {
      const imageInfo = generateUniqueImageUrl(post.title, post.categories, post.id);
      imagesToGenerate.push({
        postId: post.id,
        postTitle: post.title,
        ...imageInfo
      });
      console.log(`  - "${post.title.substring(0, 60)}..."`);
      console.log(`    Theme: ${imageInfo.theme}`);
    }
  }

  console.log(`\n\n📝 Generated ${imagesToGenerate.length} unique image requests`);
  console.log('\n' + '='.repeat(80));
  console.log('NEXT STEPS:');
  console.log('='.repeat(80));
  console.log('\nWe need to generate unique images for each blog post.');
  console.log('The images will be generated with themes matching the content.\n');
  
  // Save the list to a file for reference
  const fs = require('fs');
  fs.writeFileSync(
    '/home/ubuntu/cdm_suite_website/nextjs_space/image_generation_queue.json',
    JSON.stringify(imagesToGenerate, null, 2)
  );
  
  console.log('✅ Saved image generation queue to: image_generation_queue.json\n');
  
  return imagesToGenerate;
}

fixBlogImages()
  .then((queue) => {
    console.log(`\n✅ Analysis complete! ${queue.length} images queued for generation.`);
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    prisma.$disconnect();
    process.exit(1);
  });
