
'use client';

import React, { forwardRef } from 'react';
import { PageBlock, HeroProps } from '@/lib/page-builder-types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const HeroBlock = forwardRef<HTMLDivElement, HeroBlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as HeroProps;

    const style: React.CSSProperties = {
      backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      margin: props.margin,
      padding: props.padding || '4rem 2rem',
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
        {props.overlay && props.backgroundImage && (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: props.overlayOpacity || 0.5 }}
          />
        )}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            {props.title}
          </h1>
          {props.subtitle && (
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              {props.subtitle}
            </p>
          )}
          {props.buttonText && (
            <Button size="lg" asChild={isPreview}>
              {isPreview ? (
                <a href={props.buttonHref}>{props.buttonText}</a>
              ) : (
                <span>{props.buttonText}</span>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }
);

HeroBlock.displayName = 'HeroBlock';
