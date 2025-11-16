
import { BlogPost } from '@prisma/client';

export function generateStructuredData(post: BlogPost) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    author: {
      '@type': 'Organization',
      name: post.author,
      url: 'https://cdmsuite.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CDM Suite',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yt3.googleusercontent.com/EXz-YSeplAFRB88g3pd_EqiywVymmsnMpfYB-FbGxiZgtVvwYQ7Y0dWTaONuxSPmfgWh1_q9=s900-c-k-c0x00ffffff-no-rj',
      },
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.featuredImage || 'https://i.ytimg.com/vi/_SW66S-1x08/maxresdefault.jpg',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://cdmsuite.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.categories.join(', '),
    wordCount: post.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    inLanguage: 'en-US',
  };

  return structuredData;
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function generateMetaDescription(post: BlogPost): string {
  if (post.excerpt) return post.excerpt.substring(0, 160);
  
  const cleanContent = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return cleanContent.length > 157 
    ? cleanContent.substring(0, 157) + '...' 
    : cleanContent;
}

export function extractHeadings(content: string): { level: number; text: string; id: string }[] {
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  const headings: { level: number; text: string; id: string }[] = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, '');
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    headings.push({ level, text, id });
  }
  
  return headings;
}

export function addIdsToHeadings(content: string): string {
  return content.replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (match, level, text) => {
    const cleanText = text.replace(/<[^>]*>/g, '');
    const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
}
