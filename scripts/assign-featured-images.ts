
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

// Featured images generated
const featuredImages = {
  'AI': 'https://cdn.abacus.ai/images/cb8dc394-9673-4186-a0f8-0c41b5e3f49d.png',
  'SEO': 'https://cdn.abacus.ai/images/dcacfec5-7741-4e3a-8abf-3384066f715e.png',
  'Social Media': 'https://cdn.abacus.ai/images/2cd8a600-72a6-4752-9d1e-e04f34a7fc00.png',
  'Email': 'https://cdn.abacus.ai/images/548206ff-1b18-4055-abf9-466ecd097931.png',
  'PPC': 'https://cdn.abacus.ai/images/7b5bb832-5f34-495b-82d5-a6fb07b937c7.png',
  'Web Design': 'https://cdn.abacus.ai/images/fb7a2af4-e4cb-47e0-bfb8-f8c5f175a40e.png',
  'Analytics': 'https://cdn.abacus.ai/images/d841b1d3-13e2-49c4-916a-11a046f8cf3e.png',
  'Content': 'https://cdn.abacus.ai/images/a4e0ed5d-ef67-4727-896d-324ea5516ab8.png',
  'Mobile': 'https://cdn.abacus.ai/images/b6c182a3-6f55-427f-9603-7eae7890952f.png',
  'Trends': 'https://cdn.abacus.ai/images/39d848f4-dac6-4be1-af03-23000feeb13c.png',
};

// Keyword mapping for smart assignment
const keywordMapping = {
  'AI': ['ai', 'artificial intelligence', 'machine learning', 'automation', 'chatbot'],
  'SEO': ['seo', 'search engine', 'optimization', 'google', 'ranking', 'keywords'],
  'Social Media': ['social media', 'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'social'],
  'Email': ['email', 'newsletter', 'email marketing', 'mailchimp', 'campaigns'],
  'PPC': ['ppc', 'paid ads', 'google ads', 'facebook ads', 'advertising', 'cpc', 'cpm'],
  'Web Design': ['web design', 'website', 'ux', 'ui', 'user experience', 'development'],
  'Analytics': ['analytics', 'data', 'metrics', 'kpi', 'tracking', 'measurement', 'insights'],
  'Content': ['content', 'blog', 'writing', 'copywriting', 'storytelling', 'content marketing'],
  'Mobile': ['mobile', 'app', 'smartphone', 'ios', 'android', 'mobile marketing'],
  'Trends': ['trends', '2025', 'future', 'innovation', 'emerging', 'new', 'latest'],
};

function findBestImage(post: any): string {
  const searchText = `${post.title} ${post.content} ${post.categories.join(' ')} ${post.tags.join(' ')}`.toLowerCase();
  
  let bestMatch = 'Content'; // Default
  let bestScore = 0;

  Object.entries(keywordMapping).forEach(([category, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = searchText.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  });

  return featuredImages[bestMatch as keyof typeof featuredImages];
}

async function assignFeaturedImages() {
  console.log('Starting featured image assignment...\n');

  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        featuredImage: null, // Only update posts without featured images
      },
    });

    console.log(`Found ${posts.length} posts without featured images\n`);

    let updated = 0;

    for (const post of posts) {
      try {
        const featuredImage = findBestImage(post);

        await prisma.blogPost.update({
          where: { id: post.id },
          data: { featuredImage },
        });

        updated++;

        if (updated % 50 === 0) {
          console.log(`Assigned images to ${updated} posts...`);
        }
      } catch (error: any) {
        console.error(`Error assigning image to post "${post.title}":`, error.message);
      }
    }

    console.log(`\n✅ Successfully assigned featured images to ${updated} blog posts!`);

  } catch (error) {
    console.error('Error during image assignment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the assignment
assignFeaturedImages();
