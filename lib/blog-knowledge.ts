
import { prisma } from './db';

export async function searchBlogPosts(query: string, limit: number = 5) {
  try {
    // Simple search - in production, use full-text search or Algolia
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { excerpt: { contains: query } },
          { tags: { contains: query } },
          { categories: { contains: query } },
        ],
      },
      take: limit,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        categories: true,
        publishedAt: true,
      },
      orderBy: {
        views: 'desc',
      },
    });

    return posts;
  } catch (error) {
    console.error('Error searching blog posts:', error);
    return [];
  }
}

export async function getRelevantBlogContext(query: string): Promise<string> {
  const posts = await searchBlogPosts(query, 3);

  if (posts.length === 0) {
    return '';
  }

  const context = posts.map(
    (post: { title: string; slug: string; excerpt: string | null }, idx: number) =>
      `[${idx + 1}] "${post.title}" - ${post.excerpt || 'Read more at'} https://cdmsuite.com/blog/${post.slug}`
  ).join('\n\n');

  return `\n\nRelevant blog articles from our knowledge base:\n${context}\n\n`;
}

export async function getPopularPosts(limit: number = 10) {
  return await prisma.blogPost.findMany({
    where: { status: 'published' },
    take: limit,
    orderBy: { views: 'desc' },
    select: {
      title: true,
      slug: true,
      categories: true,
      views: true,
    },
  });
}
