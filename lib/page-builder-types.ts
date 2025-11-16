
// Type definitions for the page builder

export interface PageBlock {
  id: string;
  type: BlockType;
  props: BlockProps;
  children?: PageBlock[];
}

export type BlockType =
  | 'container'
  | 'heading'
  | 'text'
  | 'button'
  | 'image'
  | 'spacer'
  | 'columns'
  | 'hero'
  | 'features'
  | 'cta'
  | 'testimonial'
  | 'pricing'
  | 'form'
  | 'video';

export interface BlockProps {
  // Common props
  className?: string;
  style?: React.CSSProperties;
  margin?: string;
  padding?: string;
  backgroundColor?: string;
  
  // Type-specific props
  [key: string]: any;
}

export interface HeadingProps extends BlockProps {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align?: 'left' | 'center' | 'right';
  color?: string;
}

export interface TextProps extends BlockProps {
  content: string;
  align?: 'left' | 'center' | 'right';
  color?: string;
  fontSize?: string;
}

export interface ButtonProps extends BlockProps {
  text: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: string; // JavaScript code
}

export interface ImageProps extends BlockProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  rounded?: boolean;
}

export interface SpacerProps extends BlockProps {
  height: string;
}

export interface ColumnsProps extends BlockProps {
  columns: number;
  gap?: string;
}

export interface HeroProps extends BlockProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  backgroundImage?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export interface FeaturesProps extends BlockProps {
  title?: string;
  features: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
}

export interface CTAProps extends BlockProps {
  title: string;
  description?: string;
  buttonText: string;
  buttonHref: string;
  variant?: 'primary' | 'secondary';
}

export interface TestimonialProps extends BlockProps {
  quote: string;
  author: string;
  role?: string;
  image?: string;
}

export interface PricingProps extends BlockProps {
  tiers: Array<{
    name: string;
    price: string;
    period?: string;
    features: string[];
    buttonText: string;
    buttonHref: string;
    highlighted?: boolean;
  }>;
}

export interface FormProps extends BlockProps {
  title?: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    required?: boolean;
    options?: string[]; // For select fields
  }>;
  submitText: string;
  submitEndpoint: string;
}

export interface VideoProps extends BlockProps {
  src: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export interface PageSettings {
  maxWidth?: string;
  backgroundColor?: string;
  fontFamily?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: PageBlock[];
  settings?: PageSettings;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  views: number;
  requiresAuth: boolean;
  allowedRoles: string[];
  isTemplate: boolean;
  createdById: string;
  lastEditedById?: string;
  createdAt: Date;
  updatedAt: Date;
}
