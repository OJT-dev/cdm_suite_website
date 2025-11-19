
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

interface StickyCTAButtonProps {
  onScheduleClick: () => void;
  serviceName: string;
  className?: string;
}

export function StickyCTAButton({ onScheduleClick, serviceName, className = "" }: StickyCTAButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 300px
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300);

      // Hide when near the final CTA section
      const ctaSection = document.getElementById('ctaSection');
      if (ctaSection) {
        const ctaRect = ctaSection.getBoundingClientRect();
        const isNearCTA = ctaRect.top < window.innerHeight && ctaRect.bottom > 0;
        setIsAtBottom(isNearCTA);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || isAtBottom) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg py-4 px-4 md:px-6 ${className}`}>
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-gray-900">Ready to get started with {serviceName}?</p>
          <p className="text-xs text-gray-600">Schedule a free consultation today</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={onScheduleClick}
            size="lg"
            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white shadow-lg"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Now
          </Button>
          <Button
            onClick={() => {
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
            size="lg"
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            View Pricing
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
