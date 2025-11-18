
'use client';

import React, { forwardRef } from 'react';
import { PageBlock, TextProps } from '@/lib/page-builder-types';
import { cn } from '@/lib/utils';

interface TextBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const TextBlock = forwardRef<HTMLDivElement, TextBlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as TextProps;

    const style: React.CSSProperties = {
      textAlign: props.align,
      color: props.color,
      fontSize: props.fontSize,
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
          isSelected && 'outline outline-2 outline-blue-600',
          props.className
        )}
      >
        <div
          style={style}
          dangerouslySetInnerHTML={{ __html: props.content }}
        />
      </div>
    );
  }
);

TextBlock.displayName = 'TextBlock';
