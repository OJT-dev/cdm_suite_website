
// Predefined workflow templates for different services

export const WORKFLOW_TEMPLATES = {
  'web-development': {
    starter: {
      name: 'Website Development - Starter',
      estimatedDuration: 14,
      estimatedHours: 30,
      tasks: [
        {
          title: 'Initial Client Consultation',
          description: 'Gather requirements, brand guidelines, content, and design preferences',
          order: 1,
          estimatedHours: 2,
          requiredSkills: ['project_management'],
          visibleToClient: true,
        },
        {
          title: 'Design Mockup Creation',
          description: 'Create homepage and key page designs for approval',
          order: 2,
          estimatedHours: 8,
          requiredSkills: ['web_design', 'ui_ux'],
          visibleToClient: true,
        },
        {
          title: 'Design Approval',
          description: 'Present designs to client and incorporate feedback',
          order: 3,
          estimatedHours: 2,
          requiredSkills: ['project_management'],
          visibleToClient: true,
          dependencies: ['2'],
        },
        {
          title: 'Frontend Development',
          description: 'Build responsive website with approved designs',
          order: 4,
          estimatedHours: 12,
          requiredSkills: ['web_development', 'frontend'],
          dependencies: ['3'],
        },
        {
          title: 'Content Integration',
          description: 'Add client content, images, and optimize for web',
          order: 5,
          estimatedHours: 4,
          requiredSkills: ['web_development', 'content_creation'],
          dependencies: ['4'],
        },
        {
          title: 'Basic SEO Setup',
          description: 'Implement meta tags, sitemap, and basic on-page SEO',
          order: 6,
          estimatedHours: 2,
          requiredSkills: ['seo'],
          dependencies: ['5'],
        },
        {
          title: 'Final Review & Launch',
          description: 'Client review, final adjustments, and site launch',
          order: 7,
          estimatedHours: 3,
          requiredSkills: ['project_management', 'web_development'],
          visibleToClient: true,
          dependencies: ['6'],
        },
      ],
      milestones: [
        { name: 'Design Approved', order: 1, taskIndices: [2, 3] },
        { name: 'Development Complete', order: 2, taskIndices: [4, 5] },
        { name: 'Launched', order: 3, taskIndices: [7] },
      ],
    },
    growth: {
      name: 'Website Development - Growth',
      estimatedDuration: 30,
      estimatedHours: 60,
      tasks: [
        { title: 'Discovery & Strategy Session', description: 'Deep dive into business goals, target audience, and competitive analysis', order: 1, estimatedHours: 3, requiredSkills: ['project_management', 'strategy'], visibleToClient: true },
        { title: 'Sitemap & Wireframes', description: 'Create detailed sitemap and wireframes for all pages', order: 2, estimatedHours: 6, requiredSkills: ['ui_ux', 'web_design'], visibleToClient: true },
        { title: 'Custom Design System', description: 'Create comprehensive design system with custom branding', order: 3, estimatedHours: 12, requiredSkills: ['web_design', 'branding'], dependencies: ['2'] },
        { title: 'Design Approval & Revisions', description: 'Client review and up to 3 revision rounds', order: 4, estimatedHours: 4, requiredSkills: ['project_management'], visibleToClient: true, dependencies: ['3'] },
        { title: 'Frontend Development', description: 'Build fully responsive website with custom features', order: 5, estimatedHours: 20, requiredSkills: ['web_development', 'frontend'], dependencies: ['4'] },
        { title: 'Backend & CMS Setup', description: 'Configure content management system and database', order: 6, estimatedHours: 8, requiredSkills: ['web_development', 'backend'], dependencies: ['5'] },
        { title: 'Content Creation & Integration', description: 'Professional content writing and media optimization', order: 7, estimatedHours: 6, requiredSkills: ['content_creation', 'copywriting'], dependencies: ['6'] },
        { title: 'SEO & Performance Optimization', description: 'Advanced on-page SEO and speed optimization', order: 8, estimatedHours: 4, requiredSkills: ['seo', 'web_development'], dependencies: ['7'] },
        { title: 'Testing & QA', description: 'Cross-browser testing, mobile testing, and bug fixes', order: 9, estimatedHours: 4, requiredSkills: ['qa', 'web_development'], dependencies: ['8'] },
        { title: 'Launch & Training', description: 'Deploy site and train client on CMS', order: 10, estimatedHours: 3, requiredSkills: ['project_management'], visibleToClient: true, dependencies: ['9'] },
      ],
      milestones: [
        { name: 'Strategy Approved', order: 1, taskIndices: [1, 2] },
        { name: 'Design Approved', order: 2, taskIndices: [3, 4] },
        { name: 'Development Complete', order: 3, taskIndices: [5, 6, 7] },
        { name: 'Launched', order: 4, taskIndices: [10] },
      ],
    },
  },
  'seo': {
    growth: {
      name: 'SEO - Growth Package',
      estimatedDuration: 90,
      estimatedHours: 40,
      tasks: [
        { title: 'SEO Audit & Analysis', description: 'Comprehensive site audit, keyword research, and competitor analysis', order: 1, estimatedHours: 6, requiredSkills: ['seo'], visibleToClient: true },
        { title: 'Strategy Development', description: 'Create 3-month SEO roadmap and content strategy', order: 2, estimatedHours: 4, requiredSkills: ['seo', 'strategy'], visibleToClient: true, dependencies: ['1'] },
        { title: 'Technical SEO Fixes', description: 'Implement site speed, mobile, and technical improvements', order: 3, estimatedHours: 8, requiredSkills: ['seo', 'web_development'], dependencies: ['2'] },
        { title: 'On-Page Optimization', description: 'Optimize meta tags, headers, and content for target keywords', order: 4, estimatedHours: 6, requiredSkills: ['seo', 'content_creation'], dependencies: ['3'] },
        { title: 'Content Creation (Month 1)', description: 'Create and optimize 4 blog posts/articles', order: 5, estimatedHours: 8, requiredSkills: ['content_creation', 'seo'], dependencies: ['4'] },
        { title: 'Link Building Campaign', description: 'Build 10-15 quality backlinks through outreach', order: 6, estimatedHours: 6, requiredSkills: ['seo', 'outreach'], dependencies: ['4'] },
        { title: 'Monthly Reporting & Optimization', description: 'Track rankings, traffic, and adjust strategy', order: 7, estimatedHours: 2, requiredSkills: ['seo', 'analytics'], visibleToClient: true, dependencies: ['5', '6'] },
      ],
      milestones: [
        { name: 'Audit Complete', order: 1, taskIndices: [1] },
        { name: 'Technical Setup', order: 2, taskIndices: [3, 4] },
        { name: 'First Month Execution', order: 3, taskIndices: [5, 6] },
        { name: 'First Report Delivered', order: 4, taskIndices: [7] },
      ],
    },
  },
  'social-media': {
    growth: {
      name: 'Social Media Management - Growth',
      estimatedDuration: 30,
      estimatedHours: 20,
      tasks: [
        { title: 'Social Media Audit', description: 'Analyze current profiles and competitor presence', order: 1, estimatedHours: 3, requiredSkills: ['social_media', 'strategy'], visibleToClient: true },
        { title: 'Content Strategy', description: 'Create monthly content calendar and posting schedule', order: 2, estimatedHours: 4, requiredSkills: ['social_media', 'content_creation'], visibleToClient: true, dependencies: ['1'] },
        { title: 'Profile Optimization', description: 'Optimize 2-3 social profiles with branding', order: 3, estimatedHours: 2, requiredSkills: ['social_media', 'branding'], dependencies: ['2'] },
        { title: 'Content Creation', description: 'Create 12-18 posts (graphics, captions, hashtags)', order: 4, estimatedHours: 8, requiredSkills: ['graphic_design', 'content_creation'], dependencies: ['3'] },
        { title: 'Publishing & Engagement', description: 'Schedule posts and engage with audience', order: 5, estimatedHours: 2, requiredSkills: ['social_media'], dependencies: ['4'] },
        { title: 'Monthly Analytics Report', description: 'Report on reach, engagement, and growth', order: 6, estimatedHours: 1, requiredSkills: ['social_media', 'analytics'], visibleToClient: true, dependencies: ['5'] },
      ],
      milestones: [
        { name: 'Strategy Approved', order: 1, taskIndices: [1, 2] },
        { name: 'Content Created', order: 2, taskIndices: [4] },
        { name: 'Month Complete', order: 3, taskIndices: [5, 6] },
      ],
    },
  },
  'ad-management': {
    growth: {
      name: 'Ad Management - Growth',
      estimatedDuration: 30,
      estimatedHours: 25,
      tasks: [
        { title: 'Campaign Strategy', description: 'Define goals, audience, budget allocation', order: 1, estimatedHours: 3, requiredSkills: ['ppc', 'strategy'], visibleToClient: true },
        { title: 'Account Setup & Tracking', description: 'Set up ad accounts, pixels, conversion tracking', order: 2, estimatedHours: 3, requiredSkills: ['ppc', 'analytics'], dependencies: ['1'] },
        { title: 'Creative Development', description: 'Create ad copy and visuals for campaigns', order: 3, estimatedHours: 5, requiredSkills: ['ppc', 'graphic_design'], dependencies: ['2'] },
        { title: 'Campaign Launch', description: 'Launch Meta Ads and Google PPC campaigns', order: 4, estimatedHours: 3, requiredSkills: ['ppc'], visibleToClient: true, dependencies: ['3'] },
        { title: 'Ongoing Optimization', description: 'Daily monitoring and bid/targeting adjustments', order: 5, estimatedHours: 8, requiredSkills: ['ppc', 'analytics'], dependencies: ['4'] },
        { title: 'A/B Testing', description: 'Test ad variations for improved performance', order: 6, estimatedHours: 2, requiredSkills: ['ppc'], dependencies: ['5'] },
        { title: 'Monthly Performance Report', description: 'Detailed report on ad spend, conversions, ROI', order: 7, estimatedHours: 1, requiredSkills: ['ppc', 'analytics'], visibleToClient: true, dependencies: ['5', '6'] },
      ],
      milestones: [
        { name: 'Campaign Strategy Approved', order: 1, taskIndices: [1] },
        { name: 'Campaigns Launched', order: 2, taskIndices: [4] },
        { name: 'First Month Complete', order: 3, taskIndices: [7] },
      ],
    },
  },
};

// Helper to get template by service type and tier
export function getWorkflowTemplate(serviceType: string, serviceTier?: string) {
  const serviceTemplates = WORKFLOW_TEMPLATES[serviceType as keyof typeof WORKFLOW_TEMPLATES];
  if (!serviceTemplates) return null;

  const tier = (serviceTier || 'growth').toLowerCase();
  return serviceTemplates[tier as keyof typeof serviceTemplates] || serviceTemplates['growth' as keyof typeof serviceTemplates];
}
