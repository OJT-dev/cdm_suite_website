
'use client';

import React, { forwardRef } from 'react';
import { PageBlock } from '@/lib/page-builder-types';
import { cn } from '@/lib/utils';
import { EditableBlock } from '../editable-block';

interface ContainerBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
  onUpdate?: (block: PageBlock) => void;
}

export const ContainerBlock = forwardRef<HTMLDivElement, ContainerBlockProps>(
  ({ block, isSelected, isPreview, onClick, onUpdate }, ref) => {
    const props = block.props;

    const style: React.CSSProperties = {
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
            <EditableBlock
              key={childBlock.id}
              block={childBlock}
              isPreview={isPreview}
            />
          ))
        ) : (
          !isPreview && (
            <div className="p-8 border-2 border-dashed border-gray-300 text-center text-gray-400">
              Drop blocks here
            </div>
          )
        )}
      </div>
    );
  }
);

ContainerBlock.displayName = 'ContainerBlock';
