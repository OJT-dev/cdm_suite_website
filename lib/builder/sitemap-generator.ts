
// Sitemap generation utilities

export interface SitemapPage {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export function generateSitemap(subdomain: string, pages: any[], baseUrl?: string): string {
  const domain = baseUrl || `https://${subdomain}.cdmsuite.com`;
  
  // Filter out hidden pages and add URLs
  const sitemapPages: SitemapPage[] = pages
    .filter((page: any) => !page.hidden && page.slug)
    .map((page: any) => ({
      url: page.slug === 'home' 
        ? domain 
        : `${domain}?page=${page.slug}`,
      lastModified: new Date(),
      changeFrequency: getChangeFrequency(page.slug),
      priority: getPriority(page.slug),
    }));

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages.map(page => `  <url>
    <loc>${escapeXml(page.url)}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

function getChangeFrequency(slug: string): SitemapPage['changeFrequency'] {
  // Home page changes more frequently
  if (slug === 'home') return 'daily';
  
  // Blog/news pages change frequently
  if (slug === 'blog' || slug === 'news') return 'daily';
  
  // Products/shop pages change regularly
  if (slug === 'shop' || slug === 'products' || slug === 'store') return 'weekly';
  
  // Most other pages are monthly
  return 'monthly';
}

function getPriority(slug: string): number {
  // Home page highest priority
  if (slug === 'home') return 1.0;
  
  // Important pages
  if (['about', 'services', 'contact', 'products', 'shop'].includes(slug)) {
    return 0.8;
  }
  
  // Secondary pages
  if (['blog', 'portfolio', 'team'].includes(slug)) {
    return 0.6;
  }
  
  // Other pages
  return 0.5;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate robots.txt content
export function generateRobotsTxt(subdomain: string, baseUrl?: string): string {
  const domain = baseUrl || `https://${subdomain}.cdmsuite.com`;
  
  return `# robots.txt for ${domain}
User-agent: *
Allow: /
Sitemap: ${domain}/sitemap.xml

# Disallow admin and private pages
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
`;
}
