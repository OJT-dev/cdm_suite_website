import { prisma } from './lib/db';

async function main() {
  const post = await prisma.blogPost.findFirst({
    where: {
      content: { contains: '/blog/target=' }
    },
    select: {
      id: true,
      title: true,
      content: true
    }
  });
  
  if (post) {
    console.log('Post:', post.title);
    
    // Find the context around the malformed link
    const index = post.content.indexOf('/blog/target=');
    if (index >= 0) {
      console.log('\nContext around malformed link:');
      console.log(post.content.substring(index - 100, index + 200));
    }
  } else {
    console.log('No posts found with /blog/target= pattern');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
