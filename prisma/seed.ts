
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing services
  await prisma.service.deleteMany({});

  // All services organized by category
  const services = [
    // Website Maintenance
    {
      slug: 'website-maintenance-basic',
      name: 'Website Maintenance - Basic Care',
      description: 'Small websites (brochure sites, simple portfolios)',
      price: 100,
      features: [
        'Monthly updates (WordPress/core/plugins)',
        'Security scans + malware protection',
        'Monthly backup',
        'Uptime monitoring',
        '1 small content update/month'
      ],
      popular: false,
      sortOrder: 1,
    },
    {
      slug: 'website-maintenance-standard',
      name: 'Website Maintenance - Standard Support',
      description: 'Growing businesses with moderate updates',
      price: 250,
      features: [
        'Everything in Basic',
        'Bi-weekly backups',
        'Speed/performance checks',
        'Up to 3 content updates/month',
        'Contact form + basic troubleshooting',
        'Monthly report'
      ],
      popular: false,
      sortOrder: 2,
    },
    {
      slug: 'website-maintenance-business',
      name: 'Website Maintenance - Business Growth',
      description: 'Companies relying on website for leads/sales',
      price: 500,
      features: [
        'Everything in Standard',
        'Weekly backups + advanced security',
        'SEO monitoring (keywords, Google ranking check)',
        'Up to 5 content updates/month',
        'Small design tweaks (banners, images, etc.)',
        'Priority support (24-48hr response)'
      ],
      popular: true,
      sortOrder: 3,
    },
    {
      slug: 'website-maintenance-premium',
      name: 'Website Maintenance - Premium/Enterprise',
      description: 'High-traffic sites, e-commerce, or mission-critical websites',
      price: 1000,
      features: [
        'Everything in Business Growth',
        'Daily backups + firewall & DDoS protection',
        'Unlimited content updates',
        'Advanced SEO reports + recommendations',
        'Conversion tracking setup (Google Analytics, Ads)',
        'Dedicated account manager',
        'Emergency support (same-day response)'
      ],
      popular: false,
      sortOrder: 4,
    },

    // Website Creation (One-time)
    {
      slug: 'website-creation-starter',
      name: 'Website Creation - Starter',
      description: 'Perfect for small businesses and startups',
      price: 420,
      features: [
        'Semi-custom design',
        'Up to 5 pages',
        'Responsive / mobile friendly',
        'Basic on-page SEO',
        '1 revision',
        'Basic contact form'
      ],
      popular: false,
      sortOrder: 5,
    },
    {
      slug: 'website-creation-business',
      name: 'Website Creation - Growth/Business',
      description: 'For growing businesses needing more features',
      price: 975,
      features: [
        'Custom design',
        'Up to 10-15 pages',
        'Blog / news section',
        'More revisions (2-3)',
        'E-commerce capable (if needed) or payment integration',
        'More storage / bandwidth',
        'Faster turnaround'
      ],
      popular: true,
      sortOrder: 6,
    },
    {
      slug: 'website-creation-premium',
      name: 'Website Creation - Premium/Enterprise',
      description: 'Full-featured custom websites with advanced functionality',
      price: 3750,
      features: [
        'Fully custom design',
        'Unlimited / many pages',
        'Advanced functionality (member login, booking, etc.)',
        'Custom graphics, photography, potentially video integration',
        'Ongoing maintenance & support',
        'Priority support'
      ],
      popular: false,
      sortOrder: 7,
    },

    // SEO Services
    {
      slug: 'seo-local-basic',
      name: 'SEO - Local/Basic',
      description: 'Essential local SEO for small businesses',
      price: 175,
      features: [
        'On-page SEO for few pages',
        'Keyword research (local terms)',
        'Google My Business / local listing optimization',
        'Basic content optimization',
        'Monthly monitoring & report'
      ],
      popular: false,
      sortOrder: 8,
    },
    {
      slug: 'seo-growth',
      name: 'SEO - Growth',
      description: 'Comprehensive SEO for competitive markets',
      price: 600,
      features: [
        'More keywords, more pages',
        'Off-page (backlinks) strategy',
        'Technical SEO (site speed, mobile optimization)',
        'Content development (blogs, articles)',
        'Site audits every quarter',
        'Strong local + international targeting'
      ],
      popular: true,
      sortOrder: 9,
    },
    {
      slug: 'seo-comprehensive',
      name: 'SEO - Comprehensive/Global',
      description: 'Enterprise-level SEO for large organizations',
      price: 3000,
      features: [
        'Very competitive keywords',
        'Large site audits & overhaul',
        'High content output + editorial strategy',
        'Ongoing link building',
        'Detailed analytics, conversion optimization',
        'Possibly multi-language / multi-region'
      ],
      popular: false,
      sortOrder: 10,
    },

    // Social Media Management
    {
      slug: 'social-media-basic',
      name: 'Social Media - Basic/Starter',
      description: 'Essential social media presence for small businesses',
      price: 200,
      features: [
        '1 platform',
        '~8 posts/month',
        'Simple graphics',
        'Scheduling & posting',
        'Basic engagement & analytics report monthly'
      ],
      popular: false,
      sortOrder: 11,
    },
    {
      slug: 'social-media-growth',
      name: 'Social Media - Growth',
      description: 'Multi-platform social media management with ads',
      price: 490,
      features: [
        '2-3 platforms',
        '~12-18 posts/month + stories',
        'More engaging content (video, carousels)',
        'Ad budget managed (small)',
        'More frequent analytics & performance review',
        'Community management'
      ],
      popular: true,
      sortOrder: 12,
    },
    {
      slug: 'social-media-pro',
      name: 'Social Media - Pro/Full Spectrum',
      description: 'Premium social media with influencer marketing & CRO',
      price: 1600,
      features: [
        '3-5 platforms',
        'Daily posts + stories',
        'Rich multimedia content (video, animation)',
        'Higher ad spend and optimization',
        'Influencer / collaboration strategy',
        'CRO of social channels',
        'Weekly or biweekly reporting + strategy adjustments'
      ],
      popular: false,
      sortOrder: 13,
    },

    // Ad Management
    {
      slug: 'ad-management-starter',
      name: 'Ad Management - Starter',
      description: 'Perfect for small businesses testing digital advertising',
      price: 250,
      features: [
        'Meta Ads + Google PPC management',
        'Basic campaign setup, standard targeting',
        'Monthly report',
        'Content calendar (1-2 social posts/blogs)',
        'Basic SEO (on-page optimization for up to few pages)',
        'GBP / local listing optimization'
      ],
      popular: false,
      sortOrder: 14,
    },
    {
      slug: 'ad-management-growth',
      name: 'Ad Management - Growth',
      description: 'For businesses ready to scale with ads & SEO',
      price: 550,
      features: [
        'Everything in Starter, plus:',
        'Backlink building',
        'A/B testing on ads',
        'More content (blog + social media)',
        'More keywords under SEO (wider scope)',
        'Priority support'
      ],
      popular: true,
      sortOrder: 15,
    },
    {
      slug: 'ad-management-premium',
      name: 'Ad Management - Pro/Premium',
      description: 'Advanced advertising with full SEO & social integration',
      price: 1000,
      features: [
        'Everything in Growth, plus',
        'TikTok / Snapchat / additional paid social channels',
        'Advanced content / video content',
        'Full SEO + local & technical SEO audit',
        'Conversion Rate Optimization (CRO) consulting',
        'More frequent reporting / dashboard access',
        'Dedicated account manager / priority support'
      ],
      popular: false,
      sortOrder: 16,
    },
    {
      slug: 'ad-management-enterprise',
      name: 'Ad Management - Enterprise/Custom',
      description: 'Custom solutions for large campaigns with % of ad spend',
      price: 3500,
      features: [
        'All Premium features plus',
        'Custom strategy / market research',
        'Integration with other platforms (CRM, automation)',
        'More aggressive ad spend & scaling',
        'Custom KPIs, multiple markets / geographies',
        'Possibly white-glove support, more frequent check-ins',
        'Custom features'
      ],
      popular: false,
      sortOrder: 17,
    },

    // App Creation (One-time)
    {
      slug: 'app-creation-mvp',
      name: 'App Creation - MVP/Basic',
      description: 'Basic features only (user login, simple UI)',
      price: 1225,
      features: [
        'iOS or Android (native)',
        'Limited backend',
        'Basic design',
        'Minimal admin panel',
        'Testing & deployment'
      ],
      popular: false,
      sortOrder: 18,
    },
    {
      slug: 'app-creation-growth',
      name: 'App Creation - Growth/Feature-Rich',
      description: 'More complex UI/UX with multiple features',
      price: 3750,
      features: [
        'More complex UI/UX',
        'Multiple features (push notifications, payments, user roles, etc.)',
        'Support for more platforms',
        'More backend complexity',
        'Integration with APIs',
        'Testing / QA / perhaps maintenance contract'
      ],
      popular: true,
      sortOrder: 19,
    },
    {
      slug: 'app-creation-enterprise',
      name: 'App Creation - Enterprise/Custom Large-Scale',
      description: 'Complex enterprise features for high-performance apps',
      price: 12500,
      features: [
        'Complex enterprise features',
        'Multi-platform (iOS, Android, Web)',
        'High performance, security, possibly offline features',
        'Ongoing updates, support, scaling',
        'Possibly custom hardware integration or advanced features (AI, AR, etc.)'
      ],
      popular: false,
      sortOrder: 20,
    },

    // App Maintenance
    {
      slug: 'app-maintenance-basic',
      name: 'App Maintenance - Basic Care',
      description: 'Simple app / minimal usage',
      price: 350,
      features: [
        'Bug fixes',
        'OS version compatibility updates',
        'Hosting & infrastructure',
        'Security patches',
        'Monthly report',
        'Small UI tweaks or content changes (few hrs)'
      ],
      popular: false,
      sortOrder: 21,
    },
    {
      slug: 'app-maintenance-standard',
      name: 'App Maintenance - Standard Support',
      description: 'Moderate complexity app with minor enhancements',
      price: 975,
      features: [
        'All Basic features',
        'Update of third-party libraries / APIs',
        'Performance & crash monitoring',
        'More hours/month for small enhancements',
        'Tickets for critical bugs (e.g. response within 24 hrs)',
        'Biweekly or twice monthly reporting'
      ],
      popular: true,
      sortOrder: 22,
    },
    {
      slug: 'app-maintenance-premium',
      name: 'App Maintenance - Premium/Growth',
      description: 'Growing app with frequent updates and higher user base',
      price: 2750,
      features: [
        'All Standard features',
        'Proactive feature enhancements',
        'Dedicated support contact / priority response',
        'More frequent releases / sprints of improvements',
        'Advanced analytics, conversion optimization',
        'Scalability / performance optimisation'
      ],
      popular: false,
      sortOrder: 23,
    },
    {
      slug: 'app-maintenance-enterprise',
      name: 'App Maintenance - Enterprise/Mission-Critical',
      description: 'Large scale app with high SLA demands',
      price: 6500,
      features: [
        'All Premium features',
        'Very fast response SLAs',
        'Onboarding / offboarding / security audits',
        'API / backend scaling & high availability',
        'Frequent updates & large enhancements',
        'Possibly multi-region, multi-platform maintenance'
      ],
      popular: false,
      sortOrder: 24,
    },

    // Bundle Packages
    {
      slug: 'bundle-launch',
      name: 'Bundle - Launch Package',
      description: 'Starter website + basic social media + setup of Google Ads + local SEO',
      price: 900,
      features: [
        'Starter website + basic social media management (1 platform, some posts)',
        'Setup of Google Ads campaign + local SEO basics'
      ],
      popular: false,
      sortOrder: 25,
    },
    {
      slug: 'bundle-growth',
      name: 'Bundle - Growth Package',
      description: 'Business-grade website + multi-platform social + ads + growth SEO',
      price: 2100,
      features: [
        'Business-grade website (or refresh)',
        '2-3 platform social media + ads management',
        'Growth SEO',
        'Content generation'
      ],
      popular: true,
      sortOrder: 26,
    },
    {
      slug: 'bundle-enterprise',
      name: 'Bundle - Scale/Enterprise Package',
      description: 'Premium website + high-output social + full ads + top SEO + custom app',
      price: 9500,
      features: [
        'Premium website',
        'Multi-platform high-output social media (video + influencers)',
        'Full ads strategy (Google & Microsoft)',
        'Top SEO tier',
        'Custom app / web app or features'
      ],
      popular: false,
      sortOrder: 27,
    },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: {
        ...service,
        features: JSON.stringify(service.features),
      },
    });
  }

  console.log('✅ Services seeded successfully!');
  console.log(`   Created ${services.length} services`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
