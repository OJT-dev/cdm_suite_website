
'use client';

import React, { forwardRef } from 'react';
import { PageBlock, ColumnsProps } from '@/lib/page-builder-types';
import { cn } from '@/lib/utils';
import { EditableBlock } from '../editable-block';

interface ColumnsBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
  onUpdate?: (block: PageBlock) => void;
}

export const ColumnsBlock = forwardRef<HTMLDivElement, ColumnsBlockProps>(
  ({ block, isSelected, isPreview, onClick, onUpdate }, ref) => {
    const props = block.props as ColumnsProps;

    const style: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
      gap: props.gap,
      padding: props.padding,
      margin: props.margin,
      backgroundColor: props.backgroundColor,
      ...props.style,
    };

    return (
      <div
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className={cn(
          'relative',
          !isPreview && 'hover:outline hover:outline-2 hover:outline-blue-400 cursor-pointer',
          isSelected && 'outline outline-2 outline-blue-600',
          props.className
        )}
        style={style}
      >
        {block.children && block.children.length > 0 ? (
          block.children.map((childBlock) => (
            <div key={childBlock.id} className="min-h-[100px]">
              <EditableBlock
                block={childBlock}
                isPreview={isPreview}
              />
            </div>
          ))
        ) : (
          !isPreview && (
            <div className="col-span-full p-8 border-2 border-dashed border-gray-300 text-center text-gray-400">
              Drop blocks into columns
            </div>
          )
        )}
      </div>
    );
  }
);

ColumnsBlock.displayName = 'ColumnsBlock';
