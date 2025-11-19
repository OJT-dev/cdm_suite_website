import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables from both .env files
config({ path: '.env.local' });
config({ path: '.env' });

const prisma = new PrismaClient();

async function fixMalformedLinks() {
  try {
    console.log('Searching for malformed links in blog posts...\n');
    
    // Get all published posts
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
      },
    });

    let fixed = 0;
    
    for (const post of posts) {
      if (!post.content) continue;
      
      let updatedContent = post.content;
      let hasChanges = false;
      
      // Fix malformed markdown links where target= appears in the URL part
      // Pattern: [text](target="_blank") or [text](target='_blank')
      if (updatedContent.includes('](target=')) {
        console.log(`Found malformed link in: ${post.title}`);
        // Remove the malformed target attribute from markdown links
        updatedContent = updatedContent.replace(/\]\(target=["'][^"']*["']\)/g, ']()');
        hasChanges = true;
      }
      
      // Fix any href="target=" patterns that might be in HTML content
      if (updatedContent.includes('href="target=') || updatedContent.includes("href='target=")) {
        console.log(`Found malformed href in: ${post.title}`);
        updatedContent = updatedContent.replace(/href=["']target=[^"']*["']/g, 'href="#"');
        hasChanges = true;
      }
      
      // Fix any standalone /blog/target= links
      if (updatedContent.includes('/blog/target=')) {
        console.log(`Found malformed blog link in: ${post.title}`);
        updatedContent = updatedContent.replace(/\/blog\/target=[^\s)"]*/g, '/blog');
        hasChanges = true;
      }
      
      if (hasChanges) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { content: updatedContent },
        });
        fixed++;
        console.log(`  ✓ Fixed: ${post.title}\n`);
      }
    }
    
    console.log(`\nFixed ${fixed} blog posts with malformed links.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMalformedLinks();
