import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.blogPost.findFirst({
    select: {
      slug: true,
      title: true,
    }
  });
  
  if (post) {
    console.log(`http://localhost:3000/blog/${post.slug}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
