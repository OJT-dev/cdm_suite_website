
// Centralized pricing tiers for consistent pricing across the website
// Update prices here to reflect changes everywhere

export const AD_MANAGEMENT_TIERS = [
  {
    id: 'ad-starter',
    name: 'Starter',
    price: 250,
    priceRange: '$200-300',
    description: 'Small businesses or those testing digital marketing, with limited budget',
    features: [
      'Meta Ads + Google PPC management (basic campaign setup, standard targeting)',
      'Monthly report',
      'Content calendar (1-2 social posts/blogs)',
      'Basic SEO (on-page optimization for up to few pages)',
      'GBP/local listing optimization',
    ],
    popular: false,
  },
  {
    id: 'ad-growth',
    name: 'Growth',
    price: 550,
    priceRange: '$400-700',
    description: 'Businesses who want to scale, more keywords & optimization',
    features: [
      'Everything in Starter, plus:',
      'Backlink building',
      'A/B testing on ads',
      'More content (blog + social media)',
      'More keywords under SEO (wider scope)',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'ad-premium',
    name: 'Pro / Premium',
    price: 1000,
    priceRange: '$800-1,200+',
    description: 'Businesses serious about growth, larger ad budgets, multiple channels',
    features: [
      'Everything in Growth, plus:',
      'TikTok / Snapchat / additional paid social channels',
      'Advanced content / video content',
      'Full SEO + local + technical SEO audit',
      'Conversion Rate Optimization (CRO) consulting',
      'More frequent content reporting / dashboard access',
      'Dedicated account manager / priority support',
    ],
    popular: false,
  },
  {
    id: 'ad-enterprise',
    name: 'Enterprise / Custom',
    price: 3500,
    priceRange: '$2,000-5,000+ or % of ad spend + retainer',
    description: 'Large companies, or those needing a bespoke solution',
    features: [
      'All Premium features plus:',
      'Custom strategy / market research',
      'Integration with other platforms (CRM, automation)',
      'More aggressive ad spend & scaling',
      'Custom KPIs, multiple markets / geographies',
      'Possibly white-glove support, more frequent check-ins, custom features',
    ],
    popular: false,
  },
];

export const SEO_TIERS = [
  {
    id: 'seo-local-basic',
    name: 'Local / Basic SEO',
    price: 175,
    priceRange: '$175/mo',
    description: 'On-page SEO for few pages',
    features: [
      'Keyword research (local terms)',
      'Google My Business / local listing optimization',
      'Basic content optimization',
      'Monthly monitoring & report',
    ],
    popular: false,
  },
  {
    id: 'seo-growth',
    name: 'Growth SEO',
    price: 600,
    priceRange: '$400-800/mo',
    description: 'More keywords, more pages',
    features: [
      'Off-page (backlinks) strategy',
      'Technical SEO (site speed, mobile optimization)',
      'Content development (blogs, articles)',
      'Site audits every quarter',
      'Strong local + international targeting',
    ],
    popular: true,
  },
  {
    id: 'seo-comprehensive',
    name: 'Comprehensive / Global SEO',
    price: 3000,
    priceRange: '$2,500-3,500+/mo',
    description: 'Very competitive keywords',
    features: [
      'Large site audits & overhaul',
      'High content output + editorial strategy',
      'Ongoing link building',
      'Detailed analytics, conversion optimization',
      'Possibly multi-language / multi-region',
    ],
    popular: false,
  },
];

export const SOCIAL_MEDIA_TIERS = [
  {
    id: 'social-basic',
    name: 'Basic / Starter',
    price: 200,
    priceRange: '$200/mo ≈ JMD 31,000',
    description: '1 platform',
    features: [
      '~8 posts/month',
      'Simple graphics',
      'Scheduling & posting',
      'Basic engagement & analytics report monthly',
    ],
    popular: false,
  },
  {
    id: 'social-growth',
    name: 'Growth',
    price: 490,
    priceRange: '$400-580/mo ≈ JMD 65,000-93,000',
    description: '2-3 platforms',
    features: [
      '~12-18 posts/month + stories',
      'More engaging content (video, carousels)',
      'Ad budget managed (small)',
      'More frequent analytics & performance review',
      'Community management',
    ],
    popular: true,
  },
  {
    id: 'social-pro',
    name: 'Pro / Full Spectrum',
    price: 1500,
    priceRange: '$1,000-2,000/mo ≈ JMD 162,000-324,000+',
    description: '3-5 platforms',
    features: [
      'Daily posts + stories',
      'Rich multimedia content (video, animation)',
      'Higher ad spend and optimization',
      'Influencer / collaboration strategy',
      'CRO of social channels',
      'Weekly or biweekly reporting + strategy adjustments',
    ],
    popular: false,
  },
];

export const WEB_DEVELOPMENT_TIERS = [
  {
    id: 'web-starter',
    name: 'Starter',
    price: 420,
    priceRange: '$340-500 ≈ JMD 54,500-82,500',
    description: 'Semi-custom design, up to 5 pages',
    features: [
      'Semi-custom design',
      'Up to 5 pages',
      'Responsive / mobile friendly',
      'Basic on-page SEO',
      '1 revision',
      'Basic contact form',
    ],
    popular: false,
  },
  {
    id: 'web-growth',
    name: 'Growth / Business',
    price: 975,
    priceRange: '$750-$1200+ ≈ JMD 125,000-195,000',
    description: 'Custom design, up to 10-15 pages',
    features: [
      'Custom design',
      'Up to 10-15 pages',
      'Blog / news section',
      'More revisions (2-3)',
      'E-commerce capable (if needed) or payment integration',
      'More storage / bandwidth',
      'Faster turnaround',
    ],
    popular: true,
  },
  {
    id: 'web-premium',
    name: 'Premium / Enterprise',
    price: 3750,
    priceRange: '$2,500-5,000+ ≈ JMD 410,000-820,000+',
    description: 'Fully custom design, unlimited/many pages',
    features: [
      'Fully custom design',
      'Unlimited / many pages',
      'Advanced functionality (member login, booking, etc.)',
      'Custom graphics, photography, potentially video integration',
      'Ongoing maintenance & support',
      'Priority support',
    ],
    popular: false,
  },
];

export const APP_CREATION_TIERS = [
  {
    id: 'app-mvp',
    name: 'MVP / Basic',
    price: 1225,
    priceRange: '$950-1500+',
    description: 'Basic features only (user login, simple UI)',
    features: [
      'iOS or Android (maybe both)',
      'Limited backend',
      'Basic design',
      'Minimal admin panel',
      'Testing & deployment',
    ],
    popular: false,
  },
  {
    id: 'app-growth',
    name: 'Growth / Feature-Rich App',
    price: 3750,
    priceRange: '$2500-5,000+',
    description: 'More complex UI/UX, multiple features',
    features: [
      'Push notifications, payments, user roles, etc.',
      'Support for more platforms',
      'More backend complexity',
      'Integration with APIs',
      'Testing / QA / perhaps maintenance contract',
    ],
    popular: true,
  },
  {
    id: 'app-enterprise',
    name: 'Enterprise / Custom Large-Scale App',
    price: 12500,
    priceRange: '$10,000-15,000+ (or more)',
    description: 'Complex enterprise features',
    features: [
      'Multi-platform (iOS, Android, Web)',
      'High performance, security, possibly offline features',
      'Ongoing updates, support, scaling',
      'Possibly custom hardware integration or advanced features (AI, AR, etc.)',
    ],
    popular: false,
  },
];

export const WEBSITE_MAINTENANCE_TIERS = [
  {
    id: 'maintenance-basic',
    name: 'Basic Care',
    price: 100,
    priceRange: '$100 ≈ JMD 16,200',
    description: 'Small websites (brochure sites, simple portfolios)',
    features: [
      'Monthly updates (WordPress/core/plugins)',
      'Security scans + malware protection',
      'Monthly backup',
      'Uptime monitoring',
      '1 small content update/month',
    ],
    popular: false,
  },
  {
    id: 'maintenance-standard',
    name: 'Standard Support',
    price: 250,
    priceRange: '$250 ≈ JMD 40,400',
    description: 'Growing businesses with moderate updates',
    features: [
      'Everything in Basic',
      'Bi-weekly backups',
      'Speed/performance checks',
      'Up to 3 content updates/month',
      'Contact form + basic troubleshooting',
      'Monthly report',
    ],
    popular: true,
  },
  {
    id: 'maintenance-business',
    name: 'Business Growth',
    price: 500,
    priceRange: '$500 ≈ JMD 81,000',
    description: 'Companies relying on their website for leads/sales',
    features: [
      'Everything in Standard',
      'Weekly backups + advanced security',
      'SEO monitoring (keywords, Google ranking check)',
      'Up to 5 content updates/month',
      'Small design tweaks (banners, images, etc.)',
      'Priority support (24-48hr response)',
    ],
    popular: false,
  },
  {
    id: 'maintenance-premium',
    name: 'Premium / Enterprise',
    price: 1000,
    priceRange: '$1,000+ ≈ JMD 162,000+',
    description: 'High-traffic sites, e-commerce, or mission-critical websites',
    features: [
      'Everything in Business Growth',
      'Daily backups + firewall & DDoS protection',
      'Unlimited content updates',
      'Advanced SEO reports + recommendations',
      'Conversion tracking setup (Google Analytics, Ads)',
      'Dedicated account manager',
      'Emergency support (same-day response)',
    ],
    popular: false,
  },
];

export const APP_MAINTENANCE_TIERS = [
  {
    id: 'app-maintenance-basic',
    name: 'Basic Care',
    price: 350,
    priceRange: '$200-500/month ≈ JMD 32,500-81,000',
    description: 'Simple app / minimal usage user base, stable features',
    features: [
      'Bug fixes',
      'OS version compatibility updates',
      'Hosting & infrastructure',
      'Security patches',
      'Monthly report',
      'Small UI tweaks or content changes (few hrs)',
    ],
    popular: false,
  },
  {
    id: 'app-maintenance-standard',
    name: 'Standard Support',
    price: 975,
    priceRange: '$750-1,200/month ≈ JMD 122,000-195,000',
    description: 'Moderate complexity app, some integrations, regular usage, want minor enhancements',
    features: [
      'All Basic features',
      'Update of third-party libraries / APIs',
      'Performance & crash monitoring',
      'More hours/month for small enhancements',
      'Requests for critical bugs (e.g. response within 24 hrs)',
      'Biweekly or twice monthly reporting',
    ],
    popular: true,
  },
  {
    id: 'app-maintenance-premium',
    name: 'Premium / Growth',
    price: 2750,
    priceRange: '$2,000-3,500/month ≈ JMD 325,000-567,000',
    description: 'Growing app, multiple platforms, frequent updates, higher user base, more demand for features',
    features: [
      'All Standard features',
      'Proactive feature enhancements',
      'Dedicated support contact with priority response',
      'More frequent releases / sprints of improvements',
      'Advanced analytics, conversion optimization',
      'Scalability / performance optimisation',
    ],
    popular: false,
  },
  {
    id: 'app-maintenance-enterprise',
    name: 'Enterprise / Mission-Critical',
    price: 6500,
    priceRange: '$5,000-8,000+/month ≈ JMD 810,000-1.3+ million+',
    description: 'Large scale app, many users, integrations, possibly regulatory / compliance, high SLA demands',
    features: [
      'All Premium features',
      'Very fast response SLAs',
      'Onboarding / offboarding / security audits',
      'API / backend scaling & high availability',
      'Frequent updates & large enhancements',
      'Possibly multi-region, multi-platform maintenance',
    ],
    popular: false,
  },
];

// Helper function to get all tiers
export const ALL_SERVICE_TIERS = {
  adManagement: AD_MANAGEMENT_TIERS,
  seo: SEO_TIERS,
  socialMedia: SOCIAL_MEDIA_TIERS,
  webDevelopment: WEB_DEVELOPMENT_TIERS,
  appCreation: APP_CREATION_TIERS,
  websiteMaintenance: WEBSITE_MAINTENANCE_TIERS,
  appMaintenance: APP_MAINTENANCE_TIERS,
};

// Helper function to map service slugs to tier IDs
function mapServiceSlugToTierId(serviceSlug: string): string {
  // Map database slugs to tier IDs
  const slugMappings: Record<string, string> = {
    // Ad Management
    'ad-management-starter': 'ad-starter',
    'ad-management-growth': 'ad-growth',
    'ad-management-premium': 'ad-premium',
    'ad-management-enterprise': 'ad-enterprise',
    
    // Website Creation
    'website-creation-starter': 'web-starter',
    'website-creation-growth': 'web-growth',
    'website-creation-premium': 'web-premium',
    
    // App Creation
    'app-creation-mvp': 'app-mvp',
    'app-creation-growth': 'app-growth',
    'app-creation-enterprise': 'app-enterprise',
    
    // App Maintenance
    'app-maintenance-basic': 'app-maintenance-basic',
    'app-maintenance-standard': 'app-maintenance-standard',
    'app-maintenance-premium': 'app-maintenance-premium',
    'app-maintenance-enterprise': 'app-maintenance-enterprise',
    
    // Website Maintenance
    'website-maintenance-basic': 'maintenance-basic',
    'website-maintenance-standard': 'maintenance-standard',
    'website-maintenance-business': 'maintenance-business',
    'website-maintenance-premium': 'maintenance-premium',
    
    // Social Media
    'social-media-basic': 'social-basic',
    'social-media-growth': 'social-growth',
    'social-media-pro': 'social-pro',
  };
  
  // Return mapped ID or original slug (for SEO tiers which already match)
  return slugMappings[serviceSlug] || serviceSlug;
}

// Helper function to find a tier by ID
export function getTierById(tierId: string) {
  const allTiers = [
    ...AD_MANAGEMENT_TIERS,
    ...SEO_TIERS,
    ...SOCIAL_MEDIA_TIERS,
    ...WEB_DEVELOPMENT_TIERS,
    ...APP_CREATION_TIERS,
    ...WEBSITE_MAINTENANCE_TIERS,
    ...APP_MAINTENANCE_TIERS,
  ];
  
  // Map the service slug to tier ID before searching
  const mappedId = mapServiceSlugToTierId(tierId);
  return allTiers.find(tier => tier.id === mappedId);
}
