
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env first, then .env.local
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

const prisma = new PrismaClient();

async function fixGartnerLink() {
  try {
    // Find blog posts with Gartner links
    const posts = await prisma.blogPost.findMany({
      where: {
        OR: [
          { content: { contains: 'gartner.com' } },
          { content: { contains: 'Gartner' } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true
      }
    });

    console.log(`Found ${posts.length} blog posts with Gartner content`);
    
    for (const post of posts) {
      // Find Gartner URLs in the content
      const gartnerLinkRegex = /https?:\/\/[^\s\)\]]+gartner[^\s\)\]]*/gi;
      const matches = post.content.match(gartnerLinkRegex);
      
      if (matches && matches.length > 0) {
        console.log(`\nPost: ${post.title}`);
        console.log(`Links found:`, matches);
        
        // Replace the broken Gartner link with a working alternative or remove it
        let updatedContent = post.content;
        
        // Replace with a more reliable source about AI in marketing
        matches.forEach(link => {
          console.log(`  Removing broken link: ${link}`);
          // Remove the link but keep the context
          updatedContent = updatedContent.replace(
            new RegExp(link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            ''
          );
          // Clean up any markdown link syntax that might be left
          updatedContent = updatedContent.replace(/\[\s*\]\(\s*\)/g, '');
          updatedContent = updatedContent.replace(/\s{2,}/g, ' ');
        });
        
        // Update the blog post
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { content: updatedContent }
        });
        
        console.log(`  ✓ Updated blog post: ${post.slug}`);
      }
    }
    
    console.log('\n✅ All Gartner links fixed!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixGartnerLink();
