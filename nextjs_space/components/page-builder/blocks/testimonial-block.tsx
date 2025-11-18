
'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import { PageBlock, TestimonialProps } from '@/lib/page-builder-types';
import { cn } from '@/lib/utils';

interface TestimonialBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const TestimonialBlock = forwardRef<HTMLDivElement, TestimonialBlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as TestimonialProps;

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
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl md:text-2xl italic mb-6">
            "{props.quote}"
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            {props.image && (
              <Image
                src={props.image}
                alt={props.author}
                width={60}
                height={60}
                className="rounded-full"
              />
            )}
            <div className="text-left">
              <p className="font-bold">{props.author}</p>
              {props.role && (
                <p className="text-sm text-gray-600">{props.role}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TestimonialBlock.displayName = 'TestimonialBlock';
