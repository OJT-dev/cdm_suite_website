
 // NOTE: This module wraps the Stripe Node SDK and is intended for Node.js runtime only.
 // Web/Edge-safe helpers should live in `lib/stripe-config.ts`.

import Stripe from 'stripe';

// This function should only be called on the server side
export const getStripeInstance = () => {
  if (typeof window !== 'undefined') {
    throw new Error('getStripeInstance should only be called on the server side');
  }
  
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('Stripe secret key not found in environment variables');
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover',
  });
};

export const PRICING_PACKAGES = [
  {
    id: 'web-design',
    name: 'Responsive Web Design',
    price: 2999,
    description: 'Custom, conversion-optimized website',
    features: [
      'Custom responsive design',
      'Up to 10 pages',
      'SEO optimization',
      'Mobile-first approach',
      '3 rounds of revisions',
      'Contact form integration',
      '30 days post-launch support'
    ]
  },
  {
    id: 'digital-advertising',
    name: 'Digital Advertising Campaign',
    price: 1999,
    description: 'Data-driven ads for measurable growth',
    features: [
      '30-day campaign management',
      'Facebook & Instagram ads',
      'Google Ads setup',
      'Audience targeting & research',
      'A/B testing',
      'Weekly performance reports',
      'Ad creative design (up to 5)'
    ]
  },
  {
    id: 'mobile-app',
    name: 'Mobile App Development',
    price: 9999,
    description: 'Bringing your app idea to life',
    features: [
      'iOS & Android development',
      'Custom UI/UX design',
      'Up to 15 screens',
      'Backend API integration',
      'Push notifications',
      'App store submission',
      '60 days post-launch support'
    ]
  },
  {
    id: 'ai-implementation',
    name: 'AI Implementation Services',
    price: 4999,
    description: 'Integrate smart AI into your business',
    features: [
      'AI chatbot implementation',
      'Custom AI model training',
      'Process automation',
      'Data analysis & insights',
      'Integration with existing systems',
      'Staff training',
      'Ongoing optimization'
    ]
  },
  {
    id: 'full-service',
    name: 'Full Service Package',
    price: 14999,
    description: 'Complete digital transformation',
    features: [
      'Everything from all packages',
      'Priority support',
      'Dedicated project manager',
      'Monthly strategy sessions',
      'Advanced analytics dashboard',
      'Quarterly optimization',
      '1 year of support & maintenance'
    ],
    popular: true
  }
];
