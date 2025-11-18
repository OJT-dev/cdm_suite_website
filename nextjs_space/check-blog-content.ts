import { prisma } from './lib/db';

async function main() {
  const posts = await prisma.blogPost.findMany({
    where: {
      OR: [
        { content: { contains: '/blog/target=' } },
        { content: { contains: 'target=' } }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true
    },
    take: 10
  });
  
  console.log('Found posts with malformed links in content:');
  console.log(JSON.stringify(posts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
