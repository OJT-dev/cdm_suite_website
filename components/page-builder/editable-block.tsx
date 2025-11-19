
'use client';

import React, { forwardRef } from 'react';
import { PageBlock } from '@/lib/page-builder-types';
import { HeadingBlock } from './blocks/heading-block';
import { TextBlock } from './blocks/text-block';
import { ButtonBlock } from './blocks/button-block';
import { ImageBlock } from './blocks/image-block';
import { SpacerBlock } from './blocks/spacer-block';
import { ContainerBlock } from './blocks/container-block';
import { ColumnsBlock } from './blocks/columns-block';
import { HeroBlock } from './blocks/hero-block';
import { FeaturesBlock } from './blocks/features-block';
import { CTABlock } from './blocks/cta-block';
import { TestimonialBlock } from './blocks/testimonial-block';
import { PricingBlock } from './blocks/pricing-block';
import { FormBlock } from './blocks/form-block';
import { VideoBlock } from './blocks/video-block';

interface EditableBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
  onUpdate?: (block: PageBlock) => void;
}

export const EditableBlock = forwardRef<HTMLDivElement, EditableBlockProps>(
  ({ block, isSelected, isPreview, onClick, onUpdate }, ref) => {
    const commonProps = {
      block,
      isSelected,
      isPreview,
      onClick,
      onUpdate,
      ref,
    };

    switch (block.type) {
      case 'heading':
        return <HeadingBlock {...commonProps} />;
      case 'text':
        return <TextBlock {...commonProps} />;
      case 'button':
        return <ButtonBlock {...commonProps} />;
      case 'image':
        return <ImageBlock {...commonProps} />;
      case 'spacer':
        return <SpacerBlock {...commonProps} />;
      case 'container':
        return <ContainerBlock {...commonProps} />;
      case 'columns':
        return <ColumnsBlock {...commonProps} />;
      case 'hero':
        return <HeroBlock {...commonProps} />;
      case 'features':
        return <FeaturesBlock {...commonProps} />;
      case 'cta':
        return <CTABlock {...commonProps} />;
      case 'testimonial':
        return <TestimonialBlock {...commonProps} />;
      case 'pricing':
        return <PricingBlock {...commonProps} />;
      case 'form':
        return <FormBlock {...commonProps} />;
      case 'video':
        return <VideoBlock {...commonProps} />;
      default:
        return (
          <div className="p-4 border border-red-300 bg-red-50">
            Unknown block type: {block.type}
          </div>
        );
    }
  }
);

EditableBlock.displayName = 'EditableBlock';
