

// Bulk import parser for lead data

interface ParsedLead {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  interest: string;
  serviceKeywords: string[];
  rawText: string;
}

// Keywords to service mapping - Enhanced with more variations
export const SERVICE_KEYWORDS_MAP: { [key: string]: { services: string[], tier: string } } = {
  // Website keywords
  'website': { services: ['Web Development'], tier: 'web-starter' },
  'web': { services: ['Web Development'], tier: 'web-starter' },
  'site': { services: ['Web Development'], tier: 'web-starter' },
  'basic website': { services: ['Web Development'], tier: 'web-starter' },
  'custom website': { services: ['Web Development'], tier: 'web-growth' },
  'ecommerce': { services: ['Web Development'], tier: 'web-growth' },
  'online store': { services: ['Web Development'], tier: 'web-growth' },
  'domain': { services: ['Web Development', 'Website Maintenance'], tier: 'web-starter' },
  
  // SEO keywords
  'seo': { services: ['SEO'], tier: 'seo-local-basic' },
  'search engine': { services: ['SEO'], tier: 'seo-local-basic' },
  'google ranking': { services: ['SEO'], tier: 'seo-growth' },
  'optimization': { services: ['SEO'], tier: 'seo-local-basic' },
  
  // Ad Management keywords
  'google ads': { services: ['Ad Management'], tier: 'ad-starter' },
  'facebook ads': { services: ['Ad Management'], tier: 'ad-starter' },
  'advertising': { services: ['Ad Management'], tier: 'ad-growth' },
  'ppc': { services: ['Ad Management'], tier: 'ad-growth' },
  'ads': { services: ['Ad Management'], tier: 'ad-starter' },
  
  // Social Media keywords
  'social media': { services: ['Social Media Management'], tier: 'social-basic' },
  'social': { services: ['Social Media Management'], tier: 'social-basic' },
  'instagram': { services: ['Social Media Management'], tier: 'social-basic' },
  'facebook': { services: ['Social Media Management'], tier: 'social-basic' },
  'twitter': { services: ['Social Media Management'], tier: 'social-basic' },
  'tiktok': { services: ['Social Media Management'], tier: 'social-basic' },
  'social management': { services: ['Social Media Management'], tier: 'social-growth' },
  
  // Marketing keywords
  'marketing': { services: ['Ad Management', 'Social Media Management'], tier: 'ad-starter' },
  'digital marketing': { services: ['Ad Management', 'Social Media Management', 'SEO'], tier: 'ad-growth' },
  'marketing needs': { services: ['Ad Management', 'Social Media Management'], tier: 'ad-growth' },
  'online marketing': { services: ['Ad Management', 'SEO'], tier: 'ad-growth' },
  
  // Lead Generation keywords
  'lead gen': { services: ['Ad Management', 'SEO'], tier: 'ad-growth' },
  'lead generation': { services: ['Ad Management', 'SEO'], tier: 'ad-growth' },
  'leads': { services: ['Ad Management', 'SEO'], tier: 'ad-growth' },
  
  // AI & App keywords
  'ai integration': { services: ['App Creation', 'Web Development'], tier: 'app-growth' },
  'ai': { services: ['App Creation'], tier: 'app-mvp' },
  'app': { services: ['App Creation'], tier: 'app-mvp' },
  'mobile app': { services: ['App Creation'], tier: 'app-growth' },
  'application': { services: ['App Creation'], tier: 'app-mvp' },
  
  // Branding & Design
  'design': { services: ['Web Development'], tier: 'web-growth' },
  'branding': { services: ['Web Development', 'Social Media Management'], tier: 'web-growth' },
  'logo': { services: ['Web Development'], tier: 'web-starter' },
  
  // Content
  'content': { services: ['Social Media Management', 'SEO'], tier: 'social-growth' },
  'copywriting': { services: ['Web Development', 'SEO'], tier: 'web-growth' },
  'blog': { services: ['Web Development', 'SEO'], tier: 'web-growth' },
};

export function parseBulkLeadData(text: string): ParsedLead[] {
  const lines = text.split('\n').filter(line => line.trim());
  const leads: ParsedLead[] = [];

  for (const line of lines) {
    const parsed = parseSingleLine(line);
    if (parsed) {
      leads.push(parsed);
    }
  }

  return leads;
}

function parseSingleLine(line: string): ParsedLead | null {
  // Remove extra whitespace
  line = line.trim();
  if (!line) return null;

  // Extract email using regex
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
  const emailMatch = line.match(emailRegex);
  const email = emailMatch ? emailMatch[1] : null;

  // Extract phone numbers (various formats)
  // Support formats: 876-541-3595, 876 541 3595, (876) 541-3595, +1-876-541-3595
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g;
  const phoneMatches = [...line.matchAll(phoneRegex)];
  const phones = phoneMatches.map(m => m[0]);
  const phone = phones.length > 0 ? phones.join(', ') : null;

  // Extract name (usually at the start before dash or comma)
  let name = '';
  const nameParts = line.split(/[-,]/);
  if (nameParts.length > 0) {
    name = nameParts[0].trim();
    // Remove phone and email from name if they were included
    if (phone) {
      name = name.replace(new RegExp(phones.join('|'), 'g'), '').trim();
    }
    if (email) {
      name = name.replace(email, '').trim();
    }
  }

  // Extract company name (usually capitalized words or contains "ltd", "inc", etc.)
  const companyRegex = /\b([A-Z][a-zA-Z0-9\s&]+(?:ltd|inc|corp|llc|limited|company|co\.|group|enterprises|services)\b\.?)/i;
  const companyMatch = line.match(companyRegex);
  let company = companyMatch ? companyMatch[1].trim() : null;

  // If no company found with keywords, try to find capitalized business-like names
  if (!company) {
    const businessNameRegex = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,4})\b/g;
    const businessMatches = [...line.matchAll(businessNameRegex)];
    // Get the longest match that's not the person's name
    const businessNames = businessMatches
      .map(m => m[1])
      .filter(b => b !== name && b.length > name.length);
    if (businessNames.length > 0) {
      company = businessNames[0];
    }
  }

  // Extract service keywords and interests - IMPROVED DETECTION
  const lowerLine = line.toLowerCase();
  const serviceKeywords: string[] = [];
  let interest = '';

  // Check for each keyword - sort by length (longest first) to match more specific terms first
  const sortedKeywords = Object.entries(SERVICE_KEYWORDS_MAP).sort((a, b) => b[0].length - a[0].length);
  
  for (const [keyword, mapping] of sortedKeywords) {
    if (lowerLine.includes(keyword.toLowerCase())) {
      // Avoid duplicates
      if (!serviceKeywords.includes(keyword)) {
        serviceKeywords.push(keyword);
        if (!interest) {
          interest = keyword;
        } else if (!interest.includes(keyword)) {
          interest += `, ${keyword}`;
        }
      }
    }
  }

  // If no specific keywords found, extract everything after the last comma or dash as interest
  if (!interest) {
    const interestParts = line.split(/[-,]/);
    if (interestParts.length > 1) {
      interest = interestParts[interestParts.length - 1].trim();
      // Remove phone and email
      if (phone) {
        interest = interest.replace(new RegExp(phones.join('|'), 'g'), '').trim();
      }
      if (email) {
        interest = interest.replace(email, '').trim();
      }
      
      // Try to match keywords in the interest text again
      const interestLower = interest.toLowerCase();
      for (const [keyword] of sortedKeywords) {
        if (interestLower.includes(keyword.toLowerCase()) && !serviceKeywords.includes(keyword)) {
          serviceKeywords.push(keyword);
        }
      }
    }
  }

  // Validate we have at least a name
  if (!name) {
    return null;
  }

  return {
    name,
    email,
    phone,
    company,
    interest: interest || 'General inquiry',
    serviceKeywords,
    rawText: line,
  };
}

export function mapServicesToProposalItems(serviceKeywords: string[]) {
  const items: any[] = [];
  const addedServices = new Set<string>();

  for (const keyword of serviceKeywords) {
    const mapping = SERVICE_KEYWORDS_MAP[keyword];
    if (mapping) {
      for (const service of mapping.services) {
        if (!addedServices.has(service)) {
          addedServices.add(service);
          
          // Map to pricing tiers
          let price = 500;
          let description = service;
          
          if (mapping.tier.startsWith('web-')) {
            if (mapping.tier === 'web-starter') {
              price = 420;
              description = 'Basic Website (up to 5 pages)';
            } else if (mapping.tier === 'web-growth') {
              price = 975;
              description = 'Custom Business Website (10-15 pages)';
            }
          } else if (mapping.tier.startsWith('seo-')) {
            if (mapping.tier === 'seo-local-basic') {
              price = 175;
              description = 'Local SEO Package (monthly)';
            } else if (mapping.tier === 'seo-growth') {
              price = 600;
              description = 'Growth SEO Package (monthly)';
            }
          } else if (mapping.tier.startsWith('ad-')) {
            if (mapping.tier === 'ad-starter') {
              price = 250;
              description = 'Starter Ad Management (monthly)';
            } else if (mapping.tier === 'ad-growth') {
              price = 550;
              description = 'Growth Ad Management (monthly)';
            }
          } else if (mapping.tier.startsWith('social-')) {
            if (mapping.tier === 'social-basic') {
              price = 200;
              description = 'Basic Social Media Management (monthly)';
            } else if (mapping.tier === 'social-growth') {
              price = 490;
              description = 'Growth Social Media Management (monthly)';
            }
          } else if (mapping.tier.startsWith('app-')) {
            if (mapping.tier === 'app-mvp') {
              price = 1225;
              description = 'MVP Mobile App Development';
            } else if (mapping.tier === 'app-growth') {
              price = 3750;
              description = 'Feature-Rich Mobile App Development';
            }
          }

          items.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'service',
            name: service,
            description,
            quantity: 1,
            unitPrice: price,
            total: price,
            serviceId: mapping.tier,
          });
        }
      }
    }
  }

  // If no services mapped, add a generic consultation
  if (items.length === 0) {
    items.push({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'custom',
      name: 'Initial Consultation',
      description: 'Discovery call to understand your needs',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    });
  }

  return items;
}
