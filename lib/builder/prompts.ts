// AI Prompts for Website Generation

export function buildWebsiteGenerationPrompt(data: {
  businessName: string;
  industry: string;
  services: string[];
  targetAudience: string;
  goals: string[];
  template: string;
  existingWebsite?: string;
  auditInsights?: any;
}): string {
  const { businessName, industry, services, targetAudience, goals, template, existingWebsite, auditInsights } = data;

  // Check if it's an e-commerce template
  const isEcommerce = template.toLowerCase().includes('ecommerce') || 
                     template.toLowerCase().includes('store') || 
                     template.toLowerCase().includes('shop');

  let prompt = `You are an expert website content generator. Create a COMPLETE, FULL-FEATURED, MULTI-PAGE professional website with ALL necessary content for the following business:

**Business Details:**
- Name: ${businessName}
- Industry: ${industry}
- Services: ${services.join(", ")}
- Target Audience: ${targetAudience}
- Goals: ${goals.join(", ")}
- Template Style: ${template}

`;

  if (existingWebsite) {
    prompt += `**Existing Website:** ${existingWebsite}\n\n`;
  }

  if (auditInsights) {
    prompt += `**Website Audit Insights:**
- SEO Score: ${auditInsights.seoScore}/100
- Performance Score: ${auditInsights.performanceScore}/100
- Key Issues: ${auditInsights.issues?.slice(0, 3).join(", ") || "None"}
- Recommendations: ${auditInsights.recommendations?.slice(0, 3).join(", ") || "None"}

Use these insights to create improved content that addresses the identified issues.

`;
  }

  prompt += `**CRITICAL REQUIREMENTS:**
1. Create a COMPLETE MULTI-PAGE WEBSITE (minimum ${isEcommerce ? '7-8' : '6-7'} pages) - NOT just a landing page
2. Include ALL standard pages: Home, About, ${isEcommerce ? 'Shop/Products,' : 'Services,'} Portfolio/Work, Blog, Contact
3. Each page must have MULTIPLE sections with rich, detailed content
4. Include image requirements and descriptions for EVERY section
5. Write 300-500 words of content per page minimum
6. Include realistic placeholder data for portfolios, team members, testimonials${isEcommerce ? ', products with prices' : ''}, etc.
7. Make content HIGHLY SPECIFIC to the industry and business type - NO generic business language
8. Use a UNIQUE voice and personality that matches the ${targetAudience} audience
9. Add industry-specific jargon, terminology, and insider knowledge
10. Create DISTINCTIVE section titles that stand out (avoid "Our Services", "About Us" - be creative!)
`;

  if (isEcommerce) {
    prompt += `11. FOR E-COMMERCE: Include a Shop/Products page with AT LEAST 8-12 products, each with title, description, price (as string like "29.99"), and imageDescription\n`;
  }

  prompt += `
**Task:**
Generate complete website content in JSON format following this structure (adapt field names as needed but keep this overall structure).
`;

  // Add shop page example for ecommerce
  if (isEcommerce) {
    prompt += `
For e-commerce sites, include a shop/products page like this example:
{
  "slug": "shop",
  "title": "Shop",
  "metaTitle": "${businessName} Shop - Browse Our Products",
  "metaDescription": "Shop our collection of quality products",
  "hero": {
    "headline": "Shop Our Collection",
    "subheadline": "Discover quality products designed for your needs",
    "imageDescription": "Product showcase"
  },
  "sections": [
    {
      "type": "products",
      "title": "Featured Products",
      "content": "Browse our selection",
      "items": [
        {
          "title": "Product Name",
          "description": "Product description with features and benefits",
          "price": "29.99",
          "imageDescription": "High-quality product photo"
        }
        // Include 8-12 products minimum
      ]
    }
  ]
}
`;
  }

  prompt += `
Generate a complete JSON object with these required fields:
{
  "siteName": "${businessName}",
  "tagline": "Compelling brand tagline (10-15 words)",
  "pages": [
    // Array of page objects, each with:
    // - slug: URL-friendly page identifier (e.g., "home", "about", "services")
    // - title: FULL descriptive title for page content (can be long and specific)
    // - navLabel: SHORT 1-2 word label for navigation menu (CRITICAL: Must be concise!)
    // - metaTitle: SEO title (50-60 chars)
    // - metaDescription: SEO description
    // - hero object with headline, subheadline, cta, ctaSecondary, imageDescription
    // - sections array with type, title, content, items (if applicable)
    // Minimum 6-7 pages (${isEcommerce ? '7-8 for ecommerce with shop page' : 'including home, about, services, portfolio, blog, contact'})
  ],
  "contact": {
    "email": "Generated email",
    "phone": "Generated phone",
    "address": "Generated address",
    "hours": "Business hours"
  },
  "seo": {
    "metaTitle": "Main site SEO title (50-60 chars)",
    "metaDescription": "Main site description (150-160 chars)",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
}

**CRITICAL: Navigation Label Requirements**
The 'navLabel' field is displayed in the website's navigation menu. It MUST be:
- Maximum 1-2 words (e.g., "Home", "About", "Services", "Contact")
- Simple and clear (NOT "Our Services" or "About Us" - just "Services", "About")
- Professional standard web navigation terms
- Never use full sentences or descriptive phrases

**Examples of CORRECT navLabel values:**
✓ "Home" (not "Welcome to Our Business")
✓ "About" (not "Our Story and Mission")
✓ "Services" (not "What We Offer")
✓ "Portfolio" or "Work" (not "Our Amazing Projects")
✓ "Team" (not "Meet Our Experts")
✓ "Blog" or "Resources" (not "Latest News and Insights")
✓ "Contact" (not "Get In Touch Today")
✓ "Shop" or "Products" (not "Browse Our Collection")

**Page Types to Include:**
1. **Home** - navLabel: "Home" | Hero, services/products preview, about snippet, testimonials, CTA
2. **About** - navLabel: "About" | Company story, team profiles (3+ members), stats/achievements
3. **${isEcommerce ? 'Shop/Products' : 'Services'}** - navLabel: "${isEcommerce ? 'Shop' : 'Services'}" | ${isEcommerce ? '8-12 products with prices and descriptions' : 'Detailed service offerings'}, process/benefits
4. **Portfolio/Work** - navLabel: "Portfolio" or "Work" | 3+ project examples with descriptions and images
5. **Blog** - navLabel: "Blog" or "Resources" | 3+ article previews with summaries
6. **Contact** - navLabel: "Contact" | Contact methods, FAQ section (3+ questions), location info

**Content Requirements:**
- Use industry-specific terminology and ${targetAudience}-focused language
- Include appropriate Lucide React icon names for all icons (e.g., "check-circle", "zap", "users", "mail", "phone", "map-pin")
- Make CTAs specific and action-oriented (e.g., "Get Your Free Audit" not "Learn More")
- Add realistic business details (properly formatted)
- Write detailed, realistic content - NO "Lorem ipsum" placeholders
- Every section and item MUST include imageDescription field
- For ${isEcommerce ? 'products' : 'services'}, write 100+ words per item describing features and benefits

**Personality & Voice Guidelines for ${industry} targeting ${targetAudience}:**
- ${getIndustryVoiceGuidelines(industry, targetAudience)}
- Headlines should be POWERFUL and SPECIFIC (e.g., "${getHeadlineExample(industry)}" instead of generic "Welcome to Our Business")
- Use numbers, statistics, and data points where relevant
- Include social proof elements (client names, specific results, awards)
- Add urgency and value propositions throughout
- Write in a conversational yet professional tone
- Use power words and emotional triggers appropriate for the audience

**Design & Structure:**
- Hero sections should have compelling, benefit-driven headlines
- Services/products should focus on outcomes and transformations, not just features
- About section should tell a compelling story with the team's expertise
- Portfolio should showcase real results with before/after or case study format
- Blog posts should address specific pain points of ${targetAudience}
- Contact page should have strong reasons to reach out now

Respond with ONLY the raw JSON object. No markdown, no code blocks, no additional text.`;

  return prompt;
}

function getIndustryVoiceGuidelines(industry: string, audience: string): string {
  const industryLower = industry.toLowerCase();
  
  if (industryLower.includes('tech') || industryLower.includes('software') || industryLower.includes('saas')) {
    return `Use innovative, forward-thinking language. Focus on efficiency, automation, and ROI. Be data-driven and highlight scalability.`;
  }
  
  if (industryLower.includes('health') || industryLower.includes('medical') || industryLower.includes('fitness')) {
    return `Use empathetic, caring language. Focus on transformation, wellness, and life improvement. Be trustworthy and evidence-based.`;
  }
  
  if (industryLower.includes('legal') || industryLower.includes('law')) {
    return `Use authoritative, confident language. Focus on protection, peace of mind, and expertise. Be professional and results-oriented.`;
  }
  
  if (industryLower.includes('real estate') || industryLower.includes('property')) {
    return `Use aspirational, dream-focused language. Emphasize lifestyle, investment, and opportunity. Be personable yet professional.`;
  }
  
  if (industryLower.includes('food') || industryLower.includes('restaurant') || industryLower.includes('cafe')) {
    return `Use sensory, experiential language. Focus on taste, quality, and experience. Be warm, inviting, and community-focused.`;
  }
  
  if (industryLower.includes('fashion') || industryLower.includes('retail') || industryLower.includes('ecommerce')) {
    return `Use trendy, aspirational language. Focus on style, uniqueness, and self-expression. Be bold and visually descriptive.`;
  }
  
  if (industryLower.includes('agency') || industryLower.includes('marketing') || industryLower.includes('creative')) {
    return `Use bold, creative language. Focus on innovation, results, and partnerships. Be confident and showcase thought leadership.`;
  }
  
  if (industryLower.includes('consulting') || industryLower.includes('professional services')) {
    return `Use expert, strategic language. Focus on problem-solving, insights, and transformation. Be authoritative yet approachable.`;
  }
  
  if (industryLower.includes('education') || industryLower.includes('training') || industryLower.includes('course')) {
    return `Use empowering, growth-focused language. Focus on learning, transformation, and achievement. Be encouraging and results-driven.`;
  }
  
  return `Use professional, benefit-focused language. Emphasize value, quality, and customer success. Be authentic and trustworthy.`;
}

function getHeadlineExample(industry: string): string {
  const industryLower = industry.toLowerCase();
  
  if (industryLower.includes('tech') || industryLower.includes('software')) {
    return "Scale Your Business 10X with AI-Powered Automation";
  }
  if (industryLower.includes('health') || industryLower.includes('fitness')) {
    return "Transform Your Body in 90 Days - Guaranteed Results";
  }
  if (industryLower.includes('legal') || industryLower.includes('law')) {
    return "Protecting Your Rights with 20+ Years of Trial Experience";
  }
  if (industryLower.includes('real estate')) {
    return "Find Your Dream Home in [City] - Expert Local Guidance";
  }
  if (industryLower.includes('food') || industryLower.includes('restaurant')) {
    return "Farm-to-Table Cuisine That Tells a Story";
  }
  if (industryLower.includes('fashion') || industryLower.includes('retail')) {
    return "Sustainable Fashion That Doesn't Compromise on Style";
  }
  if (industryLower.includes('agency') || industryLower.includes('marketing')) {
    return "Grow Your Revenue 300% with Data-Driven Marketing";
  }
  if (industryLower.includes('consulting')) {
    return "Strategic Consulting That Drives Measurable Business Growth";
  }
  if (industryLower.includes('education')) {
    return "Master [Skill] in 12 Weeks - Career Transformation Guaranteed";
  }
  
  return "Exceptional Results Through Professional Excellence";
}

export function buildChatResponsePrompt(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  businessData?: any
): string {
  let context = "You are an AI website builder assistant helping users create their perfect website. ";
  
  if (businessData) {
    context += `Current business details: ${JSON.stringify(businessData)}. `;
  }
  
  context += "Ask clarifying questions about their business, services, target audience, and design preferences. Keep responses concise and friendly.";
  
  return context;
}
