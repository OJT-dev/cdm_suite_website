
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Volume2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { generateStructuredData, calculateReadTime, addIdsToHeadings, extractHeadings } from '@/lib/blog-seo';
import { formatBlogPost } from '@/lib/blog-formatter';
import { BlogAudioPlayer } from '@/components/blog-audio-player';
import { TableOfContents } from '@/components/table-of-contents';

export const revalidate = 3600;

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

async function getBlogPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug,
      status: 'published',
    },
  });

  if (post) {
    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });
  }

  return post;
}

async function getRelatedPosts(slug: string, categories: string[], limit: number = 3) {
  const posts = await prisma.blogPost.findMany({
    where: {
      slug: { not: slug },
      status: 'published',
      categories: {
        hasSome: categories,
      },
    },
    take: limit,
    orderBy: {
      publishedAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      categories: true,
      publishedAt: true,
      readTime: true,
    },
  });

  return posts;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const description = post.metaDescription || post.excerpt || post.content.substring(0, 160);

  return {
    title: `${post.title} | CDM Suite Blog`,
    description,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author],
      images: [
        {
          url: post.featuredImage || '/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [post.featuredImage || '/og-image.png'],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.slug, post.categories);
  const shareUrl = `https://cdmsuite.com/blog/${post.slug}`;
  const structuredData = generateStructuredData(post);
  
  // Process content for better rendering
  let processedContent = formatBlogPost(post.content);
  processedContent = addIdsToHeadings(processedContent);
  const headings = extractHeadings(processedContent);
  const readTime = post.readTime || calculateReadTime(post.content);

  return (
    <main>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navigation />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="pt-32 pb-12 px-4 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto max-w-4xl">
            <Link href="/blog">
              <Button variant="ghost" className="mb-6 -ml-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((category: string) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {post.publishedAt
                    ? format(new Date(post.publishedAt), 'MMMM d, yyyy')
                    : 'Coming soon'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{post.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <span>By {post.author}</span>
              </div>
            </div>

            {/* Audio Player */}
            {post.audioUrl && (
              <div className="mb-8">
                <BlogAudioPlayer audioUrl={post.audioUrl} title={post.title} />
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Share:</span>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {post.featuredImage && (
          <section className="px-4 mb-12">
            <div className="container mx-auto max-w-4xl">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        <section className="px-4 pb-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Table of Contents - Desktop Sidebar, Mobile Floating Button */}
              <TableOfContents headings={headings} />

              {/* Main Content */}
              <div className="lg:col-span-3">
                <article
                  className="prose prose-lg dark:prose-invert max-w-none 
                    prose-headings:scroll-mt-20 prose-headings:font-bold
                    prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
                    prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:border-b prose-h2:pb-2
                    prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6
                    prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-4
                    prose-p:mb-4 prose-p:leading-relaxed prose-p:text-base
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                    prose-strong:text-foreground prose-strong:font-bold
                    prose-em:text-foreground/90
                    prose-ul:my-4 prose-ul:space-y-2 prose-ul:list-disc prose-ul:pl-6
                    prose-ol:my-4 prose-ol:space-y-2 prose-ol:list-decimal prose-ol:pl-6
                    prose-li:text-base prose-li:leading-relaxed prose-li:pl-1
                    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4 prose-blockquote:bg-muted/50 prose-blockquote:py-2
                    prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-muted prose-pre:border prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4
                    prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                    prose-hr:my-8 prose-hr:border-border
                    prose-table:border-collapse prose-table:my-6
                    prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:font-semibold
                    prose-td:border prose-td:border-border prose-td:p-2"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />

                <Separator className="my-12" />

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8 text-center mb-12">
                  <h3 className="text-2xl font-bold mb-4">Ready to Grow Your Business?</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Get a comprehensive evaluation of your digital presence with our free marketing assessment, 
                    or run a quick website audit to identify immediate opportunities.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button size="lg" className="w-full sm:w-auto" asChild>
                      <Link href="/marketing-assessment">
                        Get Free Marketing Assessment
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                      <Link href="/auditor">
                        Run Free Website Audit
                      </Link>
                    </Button>
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                      <Link href="/contact">
                        Contact Us
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedPosts.map((relatedPost: any) => (
                        <Link
                          key={relatedPost.id}
                          href={`/blog/${relatedPost.slug}`}
                          className="group"
                        >
                          <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all">
                            <div className="relative h-40 bg-muted">
                              {relatedPost.featuredImage ? (
                                <Image
                                  src={relatedPost.featuredImage}
                                  alt={relatedPost.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20" />
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                {relatedPost.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{relatedPost.readTime} min read</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
