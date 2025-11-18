
import { Metadata } from 'next';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { BlogPostGrid } from '@/components/blog-post-grid';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Blog | CDM Suite - Digital Marketing Insights & Tips',
  description: 'Stay updated with the latest digital marketing trends, strategies, and insights from CDM Suite experts.',
};

export const revalidate = 3600; // Revalidate every hour

async function getBlogPosts(page: number = 1, limit: number = 12) {
  const skip = (page - 1) * limit;

  const [posts, totalCount] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        status: 'published',
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      skip,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        author: true,
        featuredImage: true,
        categories: true,
        tags: true,
        publishedAt: true,
      },
    }),
    prisma.blogPost.count({
      where: {
        status: 'published',
      },
    }),
  ]);

  return {
    posts,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

async function getCategories() {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: 'published',
    },
    select: {
      categories: true,
    },
  });

  const categoriesSet = new Set<string>();
  posts.forEach((post: { categories: string[] }) => {
    post.categories.forEach((cat: string) => categoriesSet.add(cat));
  });

  return Array.from(categoriesSet).sort();
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const { posts, totalCount, totalPages, currentPage } = await getBlogPosts(page);
  const categories = await getCategories();

  return (
    <main>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
              Digital Marketing Insights
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Stay ahead with expert tips, strategies, and industry insights from CDM Suite
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>{totalCount} Articles</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span>{categories.length} Categories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <BlogPostGrid
            posts={posts}
            categories={categories}
            totalPages={totalPages}
            currentPage={currentPage}
            selectedCategory={searchParams.category}
          />
        </div>
      </section>
      </div>
      <Footer />
    </main>
  );
}
