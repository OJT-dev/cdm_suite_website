import { prisma } from './lib/db';

async function main() {
  const posts = await prisma.blogPost.findMany({
    where: {
      content: { contains: '/blog/target=' }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true
    },
    take: 1
  });
  
  if (posts.length > 0) {
    const post = posts[0];
    // Find the malformed link in the content
    const matches = post.content.match(/\[([^\]]+)\]\(\/blog\/target=[^\)]+\)/g);
    console.log('Found malformed links:');
    console.log(matches);
    
    // Show context
    const index = post.content.indexOf('/blog/target=');
    if (index >= 0) {
      console.log('\nContext:');
      console.log(post.content.substring(index - 50, index + 100));
    }
  } else {
    console.log('No posts found with /blog/target= link');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
