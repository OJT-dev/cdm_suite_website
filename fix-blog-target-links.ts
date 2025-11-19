import { prisma } from './lib/db';

async function main() {
  // Find all posts with malformed target= links in content
  const posts = await prisma.blogPost.findMany({
    where: {
      content: { contains: 'target=' }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true
    }
  });
  
  console.log(`Found ${posts.length} posts with target= links`);
  
  let fixedCount = 0;
  
  for (const post of posts) {
    // Remove any malformed links with target= pattern
    let updatedContent = post.content;
    
    // Remove markdown links with target= in the URL
    updatedContent = updatedContent.replace(/\[([^\]]+)\]\([^)]*target=[^)]*\)/g, '$1');
    
    // Remove any standalone URLs with target=
    updatedContent = updatedContent.replace(/https?:\/\/[^\s]*target=[^\s]*/g, '');
    
    if (updatedContent !== post.content) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { content: updatedContent }
      });
      
      console.log(`✓ Fixed: ${post.title}`);
      fixedCount++;
    }
  }
  
  console.log(`\nFixed ${fixedCount} posts`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
