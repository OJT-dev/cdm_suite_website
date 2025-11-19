
'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import { PageBlock, ImageProps } from '@/lib/page-builder-types';
import { cn } from '@/lib/utils';

interface ImageBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const ImageBlock = forwardRef<HTMLDivElement, ImageBlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as ImageProps;

    const style: React.CSSProperties = {
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
        style={style}
      >
        <div className={cn('relative', props.rounded && 'rounded-lg overflow-hidden')}>
          {props.src ? (
            <Image
              src={props.src}
              alt={props.alt || 'Image'}
              width={props.width === '100%' ? 800 : parseInt(props.width || '800')}
              height={props.height === 'auto' ? 600 : parseInt(props.height || '600')}
              className="w-full h-auto"
              style={{ objectFit: props.objectFit }}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No image selected</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ImageBlock.displayName = 'ImageBlock';
