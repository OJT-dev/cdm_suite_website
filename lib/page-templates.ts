
// Pre-built section templates for the simplified page builder

export type SectionType = 
  | 'hero'
  | 'text'
  | 'features'
  | 'cta'
  | 'testimonials'
  | 'pricing'
  | 'form'
  | 'image'
  | 'video'
  | 'team'
  | 'faq';

export interface Section {
  id: string;
  type: SectionType;
  data: Record<string, any>;
  order: number;
}

export const sectionTemplates: Record<SectionType, { name: string; description: string; defaultData: Record<string, any> }> = {
  hero: {
    name: 'Hero Section',
    description: 'Eye-catching header with headline, subheading, and CTA',
    defaultData: {
      headline: 'Transform Your Business with Expert Digital Marketing',
      subheading: 'We help businesses grow through strategic digital marketing and automation.',
      ctaText: 'Get Started',
      ctaLink: '/contact',
      backgroundImage: '',
      alignment: 'center',
      textColor: 'white',
      overlayOpacity: 0.5,
    },
  },
  text: {
    name: 'Text Block',
    description: 'Rich text content with formatting',
    defaultData: {
      content: '<p>Add your content here...</p>',
      alignment: 'left',
      maxWidth: 'large',
    },
  },
  features: {
    name: 'Features Grid',
    description: 'Showcase features or services in a grid layout',
    defaultData: {
      title: 'Our Services',
      subtitle: 'Everything you need to grow your business',
      items: [
        {
          icon: '🚀',
          title: 'Feature 1',
          description: 'Description of feature 1',
        },
        {
          icon: '⚡',
          title: 'Feature 2',
          description: 'Description of feature 2',
        },
        {
          icon: '💡',
          title: 'Feature 3',
          description: 'Description of feature 3',
        },
      ],
      columns: 3,
    },
  },
  cta: {
    name: 'Call to Action',
    description: 'Compelling CTA section with button',
    defaultData: {
      headline: 'Ready to Get Started?',
      subheadline: 'Join hundreds of satisfied clients',
      buttonText: 'Start Now',
      buttonLink: '/contact',
      backgroundColor: 'blue',
    },
  },
  testimonials: {
    name: 'Testimonials',
    description: 'Customer testimonials and reviews',
    defaultData: {
      title: 'What Our Clients Say',
      items: [
        {
          quote: 'Working with this team transformed our business.',
          author: 'John Doe',
          position: 'CEO, Company Inc',
          image: '',
        },
      ],
    },
  },
  pricing: {
    name: 'Pricing Table',
    description: 'Display pricing plans',
    defaultData: {
      title: 'Choose Your Plan',
      subtitle: 'Flexible pricing for businesses of all sizes',
      plans: [
        {
          name: 'Starter',
          price: '$99',
          period: 'month',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          buttonText: 'Get Started',
          buttonLink: '/contact',
          featured: false,
        },
      ],
    },
  },
  form: {
    name: 'Contact Form',
    description: 'Lead capture or contact form',
    defaultData: {
      title: 'Get in Touch',
      subtitle: 'Fill out the form and we\'ll be in touch soon',
      fields: [
        { type: 'text', name: 'name', label: 'Name', required: true },
        { type: 'email', name: 'email', label: 'Email', required: true },
        { type: 'textarea', name: 'message', label: 'Message', required: true },
      ],
      submitText: 'Send Message',
      successMessage: 'Thank you! We\'ll be in touch soon.',
    },
  },
  image: {
    name: 'Image',
    description: 'Single image with optional caption',
    defaultData: {
      src: '',
      alt: '',
      caption: '',
      width: 'large',
      alignment: 'center',
    },
  },
  video: {
    name: 'Video',
    description: 'Embedded video (YouTube, Vimeo, etc.)',
    defaultData: {
      url: '',
      title: '',
      aspectRatio: '16/9',
    },
  },
  team: {
    name: 'Team Members',
    description: 'Showcase your team',
    defaultData: {
      title: 'Meet Our Team',
      subtitle: 'The experts behind your success',
      members: [
        {
          name: 'Team Member',
          position: 'Position',
          bio: 'Short bio',
          image: '',
          social: {
            linkedin: '',
            twitter: '',
          },
        },
      ],
    },
  },
  faq: {
    name: 'FAQ Section',
    description: 'Frequently asked questions',
    defaultData: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'Question 1?',
          answer: 'Answer to question 1',
        },
      ],
    },
  },
};

export function createSection(type: SectionType): Section {
  return {
    id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data: JSON.parse(JSON.stringify(sectionTemplates[type].defaultData)), // Deep clone
    order: 0,
  };
}
