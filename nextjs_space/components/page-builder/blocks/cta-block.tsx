
'use client';

import React, { forwardRef } from 'react';
import { PageBlock, CTAProps } from '@/lib/page-builder-types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CTABlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const CTABlock = forwardRef<HTMLDivElement, CTABlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as CTAProps;

    const style: React.CSSProperties = {
      padding: props.padding || '4rem 2rem',
      margin: props.margin,
      backgroundColor: props.backgroundColor || '#f3f4f6',
      ...props.style,
    };

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'relative',
          !isPreview && 'hover:outline hover:outline-2 hover:outline-blue-400 cursor-pointer',
          isSelected && 'outline outline-2 outline-blue-600',
          props.className
        )}
        style={style}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {props.title}
          </h2>
          {props.description && (
            <p className="text-xl text-gray-600 mb-8">{props.description}</p>
          )}
          <Button
            size="lg"
            variant={props.variant === 'secondary' ? 'secondary' : 'default'}
            asChild={isPreview}
          >
            {isPreview ? (
              <a href={props.buttonHref}>{props.buttonText}</a>
            ) : (
              <span>{props.buttonText}</span>
            )}
          </Button>
        </div>
      </div>
    );
  }
);

CTABlock.displayName = 'CTABlock';
