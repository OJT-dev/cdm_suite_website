
'use client';

import React, { forwardRef } from 'react';
import { PageBlock, ButtonProps } from '@/lib/page-builder-types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ButtonBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const ButtonBlock = forwardRef<HTMLDivElement, ButtonBlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as ButtonProps;

    const style: React.CSSProperties = {
      margin: props.margin,
      padding: props.padding,
      backgroundColor: props.backgroundColor,
      ...props.style,
    };

    const handleClick = (e: React.MouseEvent) => {
      if (!isPreview) {
        e.preventDefault();
        onClick?.();
      }
    };

    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          'relative inline-block',
          !isPreview && 'hover:outline hover:outline-2 hover:outline-blue-400 cursor-pointer',
          isSelected && 'outline outline-2 outline-blue-600'
        )}
        style={style}
      >
        <Button
          asChild={isPreview}
          variant={props.variant === 'primary' ? 'default' : props.variant === 'secondary' ? 'secondary' : 'outline'}
          size={props.size === 'md' ? 'default' : props.size}
          className={props.className}
        >
          {isPreview ? (
            <a href={props.href}>{props.text}</a>
          ) : (
            <span>{props.text}</span>
          )}
        </Button>
      </div>
    );
  }
);

ButtonBlock.displayName = 'ButtonBlock';
