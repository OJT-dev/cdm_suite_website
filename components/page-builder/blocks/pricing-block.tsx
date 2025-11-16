
'use client';

import React, { forwardRef } from 'react';
import { PageBlock, PricingProps } from '@/lib/page-builder-types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PricingBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const PricingBlock = forwardRef<HTMLDivElement, PricingBlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as PricingProps;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {props.tiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                'border rounded-lg p-8',
                tier.highlighted && 'border-blue-600 shadow-xl scale-105'
              )}
            >
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span className="text-gray-600 ml-2">{tier.period}</span>
                )}
              </div>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={tier.highlighted ? 'default' : 'outline'}
                asChild={isPreview}
              >
                {isPreview ? (
                  <a href={tier.buttonHref}>{tier.buttonText}</a>
                ) : (
                  <span>{tier.buttonText}</span>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

PricingBlock.displayName = 'PricingBlock';
