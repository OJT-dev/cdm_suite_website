
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Map of theme keywords to image URLs
const themeImages = {
  'seo': 'https://cdn.abacus.ai/images/e40ae8dc-f58a-49b0-80d9-93b4fc0a8313.png', // theme-01
  'social-media': 'https://cdn.abacus.ai/images/6bce51f4-ae23-4c11-95f4-ab37368e24bb.png', // theme-02
  'data-analytics': 'https://cdn.abacus.ai/images/6f223fc9-24a5-4afb-9203-bcb62f490acc.png', // theme-03
  'web-design': 'https://cdn.abacus.ai/images/bd05bb68-f1d7-49fa-9f81-dae4370eb639.png', // theme-04
  'email-automation': 'https://cdn.abacus.ai/images/1e3cb433-d6fc-4909-9d9b-762044c39ebc.png', // theme-05
  'content': 'https://cdn.abacus.ai/images/35513672-a076-4563-941b-53a950e92240.png', // theme-06
  'branding': 'https://cdn.abacus.ai/images/6dcaa98b-f295-484e-934d-3bbbbf8090d0.png', // theme-07
  'growth': 'https://cdn.abacus.ai/images/fa4ed89f-f0fd-434b-9e75-7ee7321dbc22.png', // theme-08
  'ai': 'https://cdn.abacus.ai/images/176ab875-5f1f-42a2-acfd-ee3bca4b301a.png', // theme-09
  'paid-ads': 'https://cdn.abacus.ai/images/d8e3a7d1-8c66-4b79-b0c9-2db3e4113cb0.png', // theme-10
  'ecommerce': 'https://cdn.abacus.ai/images/41248d5d-645f-4329-a707-9d4d10f18fc5.png', // theme-11
  'b2b': 'https://cdn.abacus.ai/images/8d7e1907-21fe-47d3-9a50-bfcc39aff018.png', // theme-12
  'startup': 'https://cdn.abacus.ai/images/3d8872ed-0a53-4377-bbcc-1968737cfce9.png', // theme-13
  'automation': 'https://cdn.abacus.ai/images/58bd0c79-3693-49b1-867e-c99ebfbed6b3.png', // theme-14
  'strategy': 'https://cdn.abacus.ai/images/5562d8d0-a595-4699-9259-260ee580a6ec.png', // theme-15
};

// All available images as array for fallback
const allImages = Object.values(themeImages);

// Function to determine theme from post title and categories
function determineTheme(title, categories) {
  const text = (title + ' ' + categories.join(' ')).toLowerCase();
  
  // Check for specific themes
  if (text.match(/\b(seo|search|ranking|organic|keyword)\b/)) return 'seo';
  if (text.match(/\b(social|facebook|instagram|twitter|linkedin|tiktok|fb|ig)\b/)) return 'social-media';
  if (text.match(/\b(data|analytics|metrics|insights|dashboard|kpi|reporting)\b/)) return 'data-analytics';
  if (text.match(/\b(web|website|design|ui|ux|responsive|landing)\b/)) return 'web-design';
  if (text.match(/\b(email|automation|workflow|drip|nurture)\b/)) return 'email-automation';
  if (text.match(/\b(content|blog|article|writing|publish)\b/)) return 'content';
  if (text.match(/\b(brand|logo|identity|design|visual)\b/)) return 'branding';
  if (text.match(/\b(growth|roi|revenue|profit|scale|expand)\b/)) return 'growth';
  if (text.match(/\b(ai|artificial intelligence|machine learning|ml)\b/)) return 'ai';
  if (text.match(/\b(google ads|ppc|paid|advertising|adwords|ads)\b/)) return 'paid-ads';
  if (text.match(/\b(ecommerce|shopify|store|cart|product)\b/)) return 'ecommerce';
  if (text.match(/\b(b2b|enterprise|saas|business to business)\b/)) return 'b2b';
  if (text.match(/\b(startup|founder|entrepreneur|launch)\b/)) return 'startup';
  if (text.match(/\b(automation|automate|workflow|process)\b/)) return 'automation';
  if (text.match(/\b(strategy|strategic|plan|roadmap)\b/)) return 'strategy';
  
  // Default to general marketing
  return 'strategy';
}

async function assignBlogImages() {
  console.log('🔄 Starting intelligent image assignment with variety optimization...\n');
  
  // Get all published posts ordered by publishedAt
  const posts = await prisma.blogPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      categories: true,
      featuredImage: true,
    }
  });

  console.log(`Found ${posts.length} published posts\n`);

  let updateCount = 0;
  const recentImages = []; // Track last 5 images to ensure variety
  const imageUsageCount = {};

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const theme = determineTheme(post.title, post.categories);
    let newImage = themeImages[theme];

    // Get primary and fallback options based on theme
    const themeOptions = [
      themeImages[theme],
      ...allImages.filter(img => img !== themeImages[theme])
    ];

    // Ensure this image wasn't used in the last 5 posts
    let attempts = 0;
    while (recentImages.includes(newImage) && attempts < themeOptions.length) {
      newImage = themeOptions[attempts % themeOptions.length];
      attempts++;
    }

    // Track this image in recent history
    recentImages.push(newImage);
    if (recentImages.length > 5) {
      recentImages.shift(); // Keep only last 5
    }

    // Track usage
    if (!imageUsageCount[newImage]) {
      imageUsageCount[newImage] = 0;
    }
    imageUsageCount[newImage]++;

    // Update the post if the image is different
    if (post.featuredImage !== newImage) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { featuredImage: newImage }
      });
      updateCount++;
      
      if (updateCount % 20 === 0) {
        console.log(`✅ Updated ${updateCount} posts...`);
      }
    }
  }

  console.log(`\n✅ Successfully updated ${updateCount} blog post images!`);
  console.log('\n📊 Image distribution (sorted by usage):');
  Object.entries(imageUsageCount).sort((a, b) => b[1] - a[1]).forEach(([img, count]) => {
    const themeName = Object.keys(themeImages).find(key => themeImages[key] === img) || 'unknown';
    console.log(`  ${themeName.padEnd(20)}: ${count} posts`);
  });
  
  console.log('\n✅ Variety check: No image appears in consecutive posts!');
}

assignBlogImages()
  .then(() => {
    console.log('\n✅ Image assignment complete!');
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    prisma.$disconnect();
    process.exit(1);
  });
