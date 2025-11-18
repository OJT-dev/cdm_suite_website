
'use client';

import React, { forwardRef } from 'react';
import { PageBlock, SpacerProps } from '@/lib/page-builder-types';
import { cn } from '@/lib/utils';

interface SpacerBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const SpacerBlock = forwardRef<HTMLDivElement, SpacerBlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as SpacerProps;

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'relative',
          !isPreview && 'hover:outline hover:outline-2 hover:outline-blue-400 cursor-pointer',
          isSelected && 'outline outline-2 outline-blue-600'
        )}
        style={{ height: props.height }}
      >
        {!isPreview && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Spacer ({props.height})
          </div>
        )}
      </div>
    );
  }
);

SpacerBlock.displayName = 'SpacerBlock';
