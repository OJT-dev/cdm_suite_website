
'use client';

import React, { forwardRef } from 'react';
import { PageBlock, FeaturesProps } from '@/lib/page-builder-types';
import { cn } from '@/lib/utils';

interface FeaturesBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const FeaturesBlock = forwardRef<HTMLDivElement, FeaturesBlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as FeaturesProps;

    const style: React.CSSProperties = {
      padding: props.padding || '4rem 2rem',
      margin: props.margin,
      backgroundColor: props.backgroundColor,
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
        {props.title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {props.title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {props.features.map((feature, index) => (
            <div key={index} className="text-center">
              {feature.icon && (
                <div className="text-5xl mb-4">{feature.icon}</div>
              )}
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

FeaturesBlock.displayName = 'FeaturesBlock';
