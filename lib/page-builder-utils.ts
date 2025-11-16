
// Utility functions for the page builder

import { PageBlock, BlockType } from './page-builder-types';

export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createBlock(type: BlockType, props: any = {}): PageBlock {
  return {
    id: generateBlockId(),
    type,
    props: getDefaultProps(type, props),
    children: ['container', 'columns'].includes(type) ? [] : undefined,
  };
}

export function getDefaultProps(type: BlockType, customProps: any = {}): any {
  const defaults: Record<BlockType, any> = {
    container: {
      padding: '2rem',
      backgroundColor: 'transparent',
    },
    heading: {
      text: 'New Heading',
      level: 2,
      align: 'left',
      color: '#000000',
    },
    text: {
      content: 'Add your text here...',
      align: 'left',
      color: '#333333',
      fontSize: '1rem',
    },
    button: {
      text: 'Click Me',
      href: '#',
      variant: 'primary',
      size: 'md',
    },
    image: {
      src: '/placeholder.png',
      alt: 'Image',
      width: '100%',
      height: 'auto',
      objectFit: 'cover',
      rounded: false,
    },
    spacer: {
      height: '2rem',
    },
    columns: {
      columns: 2,
      gap: '2rem',
    },
    hero: {
      title: 'Welcome to Our Site',
      subtitle: 'Discover amazing features and services',
      buttonText: 'Get Started',
      buttonHref: '#',
      overlay: true,
      overlayOpacity: 0.5,
    },
    features: {
      title: 'Our Features',
      features: [
        {
          icon: '🚀',
          title: 'Fast',
          description: 'Lightning fast performance',
        },
        {
          icon: '🎨',
          title: 'Beautiful',
          description: 'Stunning visual design',
        },
        {
          icon: '🔒',
          title: 'Secure',
          description: 'Enterprise-grade security',
        },
      ],
    },
    cta: {
      title: 'Ready to get started?',
      description: 'Join thousands of satisfied customers today',
      buttonText: 'Sign Up Now',
      buttonHref: '#',
      variant: 'primary',
    },
    testimonial: {
      quote: 'This is an amazing product! Highly recommended.',
      author: 'John Doe',
      role: 'CEO, Company Inc',
    },
    pricing: {
      tiers: [
        {
          name: 'Basic',
          price: '$9',
          period: 'per month',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          buttonText: 'Get Started',
          buttonHref: '#',
        },
        {
          name: 'Pro',
          price: '$29',
          period: 'per month',
          features: ['All Basic features', 'Feature 4', 'Feature 5', 'Feature 6'],
          buttonText: 'Get Started',
          buttonHref: '#',
          highlighted: true,
        },
      ],
    },
    form: {
      title: 'Contact Us',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
      ],
      submitText: 'Send Message',
      submitEndpoint: '/api/contact',
    },
    video: {
      src: '',
      autoplay: false,
      controls: true,
      loop: false,
      muted: false,
    },
  };

  return { ...defaults[type], ...customProps };
}

export function findBlockById(blocks: PageBlock[], id: string): PageBlock | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function updateBlock(
  blocks: PageBlock[],
  id: string,
  updates: Partial<PageBlock>
): PageBlock[] {
  return blocks.map((block) => {
    if (block.id === id) {
      return { ...block, ...updates };
    }
    if (block.children) {
      return {
        ...block,
        children: updateBlock(block.children, id, updates),
      };
    }
    return block;
  });
}

export function deleteBlock(blocks: PageBlock[], id: string): PageBlock[] {
  return blocks
    .filter((block) => block.id !== id)
    .map((block) => {
      if (block.children) {
        return {
          ...block,
          children: deleteBlock(block.children, id),
        };
      }
      return block;
    });
}

export function duplicateBlock(block: PageBlock): PageBlock {
  const newBlock = {
    ...block,
    id: generateBlockId(),
  };

  if (newBlock.children) {
    newBlock.children = newBlock.children.map(duplicateBlock);
  }

  return newBlock;
}

export function moveBlock(
  blocks: PageBlock[],
  dragId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside'
): PageBlock[] {
  const dragBlock = findBlockById(blocks, dragId);
  if (!dragBlock) return blocks;

  // Remove the dragged block
  let newBlocks = deleteBlock(blocks, dragId);

  // Find where to insert it
  const insertBlock = (blocks: PageBlock[]): PageBlock[] => {
    const targetIndex = blocks.findIndex((b) => b.id === targetId);
    
    if (targetIndex !== -1) {
      if (position === 'before') {
        return [
          ...blocks.slice(0, targetIndex),
          dragBlock,
          ...blocks.slice(targetIndex),
        ];
      } else if (position === 'after') {
        return [
          ...blocks.slice(0, targetIndex + 1),
          dragBlock,
          ...blocks.slice(targetIndex + 1),
        ];
      } else {
        // inside
        const target = blocks[targetIndex];
        if (target.children) {
          return blocks.map((b, i) =>
            i === targetIndex
              ? { ...b, children: [...b.children!, dragBlock] }
              : b
          );
        }
      }
    }

    // Recursively search in children
    return blocks.map((block) => {
      if (block.children) {
        return { ...block, children: insertBlock(block.children) };
      }
      return block;
    });
  };

  return insertBlock(newBlocks);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
