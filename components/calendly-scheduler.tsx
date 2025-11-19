
"use client";

import { useState, useEffect } from "react";

interface CalendlySchedulerProps {
  url: string;
  onScheduleClick?: () => void;
}

export default function CalendlyScheduler({ url, onScheduleClick }: CalendlySchedulerProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    
    script.onload = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="mt-8 min-h-[700px] relative">
      {isLoading && (
        <div className="flex justify-center items-center h-full pt-20">
          <div className="w-9 h-9 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      <div className={`${isLoading ? 'hidden' : 'block'} fade-in`}>
        <div 
          className="calendly-inline-widget" 
          data-url={url}
          style={{ minWidth: '320px', height: '700px' }}
        ></div>
      </div>
    </div>
  );
}
