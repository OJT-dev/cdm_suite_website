
// Content validation utilities for AI Builder

import * as LucideIcons from "lucide-react";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Get list of valid Lucide icon names
export function getValidIconNames(): string[] {
  return Object.keys(LucideIcons);
}

// Validate icon name exists in Lucide
export function isValidIcon(iconName: string): boolean {
  if (!iconName) return true; // Empty is ok
  const validIcons = getValidIconNames();
  return validIcons.includes(iconName);
}

// Validate a single page object
export function validatePage(page: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!page.slug) errors.push("Page must have a slug");
  if (!page.title) errors.push("Page must have a title");
  
  // Navigation label validation
  if (page.navLabel && page.navLabel.split(' ').length > 3) {
    warnings.push(`Navigation label "${page.navLabel}" is too long. Should be 1-2 words.`);
  }

  // Hero validation
  if (page.hero) {
    if (!page.hero.headline) warnings.push("Hero section missing headline");
    if (!page.hero.subheadline) warnings.push("Hero section missing subheadline");
  }

  // Sections validation
  if (page.sections) {
    page.sections.forEach((section: any, idx: number) => {
      // Validate section type
      const validTypes = [
        "services", "features", "benefits", "portfolio", "work",
        "team", "testimonials", "stats", "process", "faq",
        "products", "shop", "pricing", "content"
      ];
      
      if (section.type && !validTypes.includes(section.type)) {
        warnings.push(`Section ${idx} has invalid type: ${section.type}`);
      }

      // Validate icons in section items
      if (section.items) {
        section.items.forEach((item: any, itemIdx: number) => {
          if (item.icon && !isValidIcon(item.icon)) {
            errors.push(`Section ${idx}, item ${itemIdx}: Invalid icon name "${item.icon}"`);
            // Auto-fix by removing invalid icon
            item.icon = "Circle";
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Validate entire website content
export function validateWebsiteContent(content: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate site config
  if (!content.siteName) errors.push("Site must have a name");
  if (!content.tagline) warnings.push("Site missing tagline");

  // Validate pages array
  if (!content.pages || !Array.isArray(content.pages)) {
    errors.push("Site must have pages array");
    return { valid: false, errors, warnings };
  }

  if (content.pages.length === 0) {
    errors.push("Site must have at least one page");
  }

  // Validate each page
  content.pages.forEach((page: any, idx: number) => {
    const pageResult = validatePage(page);
    errors.push(...pageResult.errors.map(e => `Page ${idx} (${page.slug || 'unknown'}): ${e}`));
    warnings.push(...pageResult.warnings.map(w => `Page ${idx} (${page.slug || 'unknown'}): ${w}`));
  });

  // Check for duplicate slugs
  const slugs = content.pages.map((p: any) => p.slug).filter(Boolean);
  const duplicates = slugs.filter((slug: string, idx: number) => slugs.indexOf(slug) !== idx);
  if (duplicates.length > 0) {
    errors.push(`Duplicate page slugs found: ${duplicates.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Auto-fix common issues
export function autoFixContent(content: any): any {
  const fixed = JSON.parse(JSON.stringify(content)); // Deep clone

  // Ensure required fields
  if (!fixed.siteName) fixed.siteName = "My Business";
  if (!fixed.tagline) fixed.tagline = "Professional services";
  if (!fixed.pages) fixed.pages = [];

  // Fix each page
  fixed.pages = fixed.pages.map((page: any) => {
    // Ensure required fields
    if (!page.slug) page.slug = "page";
    if (!page.title) page.title = "Page";
    
    // Fix nav label if too long
    if (!page.navLabel || page.navLabel.split(' ').length > 3) {
      page.navLabel = formatSlugToNavLabel(page.slug);
    }

    // Ensure hero object
    if (!page.hero) {
      page.hero = {
        headline: page.title,
        subheadline: "Professional services and solutions",
        cta: "Get Started",
      };
    }

    // Ensure sections array
    if (!page.sections) page.sections = [];

    // Fix icons in sections
    page.sections = page.sections.map((section: any) => {
      if (section.items) {
        section.items = section.items.map((item: any) => {
          if (item.icon && !isValidIcon(item.icon)) {
            item.icon = "Circle"; // Default fallback icon
          }
          return item;
        });
      }
      return section;
    });

    // Add meta fields if missing
    if (!page.metaTitle) {
      page.metaTitle = `${page.title} | ${fixed.siteName}`;
    }
    if (!page.metaDescription) {
      page.metaDescription = page.hero?.subheadline || `${page.title} page`;
    }

    return page;
  });

  return fixed;
}

// Helper to format slug into nav label
function formatSlugToNavLabel(slug: string): string {
  const standardLabels: Record<string, string> = {
    'home': 'Home',
    'about': 'About',
    'about-us': 'About',
    'services': 'Services',
    'our-services': 'Services',
    'products': 'Products',
    'shop': 'Shop',
    'store': 'Store',
    'portfolio': 'Portfolio',
    'work': 'Work',
    'projects': 'Projects',
    'team': 'Team',
    'blog': 'Blog',
    'news': 'News',
    'contact': 'Contact',
    'contact-us': 'Contact',
    'pricing': 'Pricing',
  };

  if (standardLabels[slug]) {
    return standardLabels[slug];
  }

  // Capitalize first letter of each word, max 2 words
  const words = slug.split('-');
  const label = words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return label;
}

// Check if content has e-commerce features
export function isEcommerceContent(content: any): boolean {
  if (!content.pages) return false;
  
  return content.pages.some((page: any) => 
    page.slug === "shop" || 
    page.slug === "products" || 
    page.slug === "store" ||
    page.sections?.some((section: any) => 
      section.type === "products" || section.type === "shop"
    )
  );
}
