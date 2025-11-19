import { prisma } from './lib/db';

async function main() {
  const posts = await prisma.blogPost.findMany({
    where: {
      slug: {
        contains: 'target='
      }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true
    }
  });
  
  console.log('Found posts with malformed slugs:');
  console.log(JSON.stringify(posts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
