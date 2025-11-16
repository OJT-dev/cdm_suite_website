
'use client';

import React, { forwardRef } from 'react';
import { PageBlock, HeadingProps } from '@/lib/page-builder-types';
import { cn } from '@/lib/utils';

interface HeadingBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const HeadingBlock = forwardRef<HTMLDivElement, HeadingBlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as HeadingProps;
    const Tag = `h${props.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    const style: React.CSSProperties = {
      textAlign: props.align,
      color: props.color,
      margin: props.margin,
      padding: props.padding,
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
          isSelected && 'outline outline-2 outline-blue-600'
        )}
      >
        <Tag
          className={cn(
            'font-bold',
            props.level === 1 && 'text-4xl md:text-6xl',
            props.level === 2 && 'text-3xl md:text-5xl',
            props.level === 3 && 'text-2xl md:text-4xl',
            props.level === 4 && 'text-xl md:text-3xl',
            props.level === 5 && 'text-lg md:text-2xl',
            props.level === 6 && 'text-base md:text-xl',
            props.className
          )}
          style={style}
        >
          {props.text}
        </Tag>
      </div>
    );
  }
);

HeadingBlock.displayName = 'HeadingBlock';
