
'use client';

import React, { forwardRef } from 'react';
import { PageBlock, VideoProps } from '@/lib/page-builder-types';
import { cn } from '@/lib/utils';

interface VideoBlockProps {
  block: PageBlock;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

export const VideoBlock = forwardRef<HTMLDivElement, VideoBlockProps>(
  ({ block, isSelected, isPreview, onClick }, ref) => {
    const props = block.props as VideoProps;

    const style: React.CSSProperties = {
      padding: props.padding,
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
        {props.src ? (
          <video
            src={props.src}
            autoPlay={props.autoplay}
            controls={props.controls}
            loop={props.loop}
            muted={props.muted}
            className="w-full h-auto"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No video selected</p>
          </div>
        )}
      </div>
    );
  }
);

VideoBlock.displayName = 'VideoBlock';
