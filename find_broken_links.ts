
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

const prisma = new PrismaClient();

async function findBrokenLinks() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        OR: [
          { content: { contains: 'target=' } },
          { content: { contains: 'href="/blog/target' } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true
      }
    });

    console.log(`Found ${posts.length} posts with potential broken links`);
    
    for (const post of posts) {
      // Look for malformed links
      const malformedLinks = post.content.match(/href=["'][^"']*\/blog\/target[^"']*["']/gi);
      if (malformedLinks) {
        console.log(`\n❌ Post: ${post.title.substring(0, 60)}`);
        console.log(`Slug: ${post.slug}`);
        console.log(`Broken links found:`, malformedLinks);
        
        // Try to fix the content
        let fixedContent = post.content;
        
        // Remove malformed target= links
        fixedContent = fixedContent.replace(/href=["']\/blog\/target=["']/gi, 'href="/blog"');
        fixedContent = fixedContent.replace(/href=["'][^"']*\/blog\/target[^"']*["']/gi, 'href="/blog"');
        
        if (fixedContent !== post.content) {
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { content: fixedContent }
          });
          console.log(`✓ Fixed broken links in: ${post.slug}`);
        }
      }
    }
    
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findBrokenLinks();
