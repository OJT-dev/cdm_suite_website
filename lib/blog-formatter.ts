/**
 * Enhanced blog post content formatter
 * Transforms plain HTML into beautifully formatted content
 */

export function enhanceBlogContent(content: string): string {
  let enhanced = content;

  // FIRST: Add proper spacing between HTML elements
  // Add newlines before and after major block elements
  enhanced = enhanced.replace(/<\/p><p>/gi, '</p>\n\n<p>');
  enhanced = enhanced.replace(/<\/p><h/gi, '</p>\n\n<h');
  enhanced = enhanced.replace(/<\/h([1-6])><p>/gi, '</h$1>\n\n<p>');
  enhanced = enhanced.replace(/<\/h([1-6])><h/gi, '</h$1>\n\n<h');
  enhanced = enhanced.replace(/<\/ul><p>/gi, '</ul>\n\n<p>');
  enhanced = enhanced.replace(/<\/p><ul>/gi, '</p>\n\n<ul>');
  enhanced = enhanced.replace(/<\/ol><p>/gi, '</ol>\n\n<p>');
  enhanced = enhanced.replace(/<\/p><ol>/gi, '</p>\n\n<ol>');
  enhanced = enhanced.replace(/<li>/gi, '\n  <li>');
  enhanced = enhanced.replace(/<\/li>/gi, '</li>\n');
  enhanced = enhanced.replace(/<ul>/gi, '<ul>\n');
  enhanced = enhanced.replace(/<\/ul>/gi, '\n</ul>');
  enhanced = enhanced.replace(/<ol>/gi, '<ol>\n');
  enhanced = enhanced.replace(/<\/ol>/gi, '\n</ol>');

  // Add wrapper divs for better styling control
  enhanced = enhanced.replace(/<h2>(.*?)<\/h2>/gi, (match, text) => {
    return `\n\n<div class="section-break"></div>\n<h2>${text}</h2>`;
  });

  // Enhance lists with better spacing and icons
  enhanced = enhanced.replace(/<ul>(.*?)<\/ul>/gis, (match, items) => {
    return `<ul class="feature-list">${items}</ul>`;
  });

  enhanced = enhanced.replace(/<ol>(.*?)<\/ol>/gis, (match, items) => {
    return `<ol class="numbered-list">${items}</ol>`;
  });

  // Add styling to emphasis and strong tags
  enhanced = enhanced.replace(/<strong>(.*?)<\/strong>/gi, '<strong class="highlight">$1</strong>');
  
  // Enhance links
  enhanced = enhanced.replace(/<a href="([^"]*)">(.*?)<\/a>/gi, '<a href="$1" class="inline-link" target="_blank" rel="noopener noreferrer">$2</a>');

  // Add call-out boxes for important paragraphs (those starting with Note:, Important:, etc.)
  enhanced = enhanced.replace(/<p>(Note:|Important:|Warning:|Tip:|Pro Tip:)(.*?)<\/p>/gi, '<div class="callout callout-info"><p><strong>$1</strong>$2</p></div>');

  // Format citations/references better [1], [2], etc.
  enhanced = enhanced.replace(/\[(\d+)\]/g, '<sup class="citation"><a href="#ref-$1">[$1]</a></sup>');

  // Enhance paragraphs after headings
  enhanced = enhanced.replace(/<\/h[23]>\s*<p>/gi, (match) => {
    return match.replace('<p>', '\n<p class="lead-paragraph">');
  });

  return enhanced;
}

/**
 * Clean up and sanitize blog content
 */
export function sanitizeBlogContent(content: string): string {
  // Remove any potentially harmful scripts
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove inline styles that might break our design
  sanitized = sanitized.replace(/style="[^"]*"/gi, '');
  
  // Ensure all images have alt text
  sanitized = sanitized.replace(/<img([^>]*)>/gi, (match, attrs) => {
    if (!attrs.includes('alt=')) {
      return `<img${attrs} alt="Blog post image">`;
    }
    return match;
  });

  return sanitized;
}

/**
 * Add reading progress indicators
 */
export function wrapContentInSections(content: string): string {
  // Split content by h2 tags to create sections
  const sections = content.split(/(<h2[^>]*>.*?<\/h2>)/gi);
  
  let wrapped = '';
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].match(/<h2/)) {
      // Start new section
      if (i > 0) wrapped += '</section>';
      wrapped += '<section class="blog-section">' + sections[i];
    } else {
      wrapped += sections[i];
    }
  }
  
  if (wrapped.includes('<section')) {
    wrapped += '</section>';
  }
  
  return wrapped;
}

/**
 * Format code blocks with syntax highlighting classes
 */
export function enhanceCodeBlocks(content: string): string {
  return content.replace(/<pre><code>(.*?)<\/code><\/pre>/gis, (match, code) => {
    return `<pre class="code-block"><code>${code}</code></pre>`;
  });
}

/**
 * Master function to apply all enhancements
 */
export function formatBlogPost(content: string): string {
  let formatted = sanitizeBlogContent(content);
  formatted = enhanceBlogContent(formatted);
  formatted = enhanceCodeBlocks(formatted);
  
  return formatted;
}
