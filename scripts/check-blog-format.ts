import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.blogPost.findMany({
    take: 2,
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
    }
  });
  
  posts.forEach(post => {
    console.log('='.repeat(80));
    console.log('Title:', post.title);
    console.log('Excerpt:', post.excerpt);
    console.log('\nContent Preview (first 800 chars):');
    console.log(post.content.substring(0, 800));
    console.log('\n' + '='.repeat(80));
    console.log('\n');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
