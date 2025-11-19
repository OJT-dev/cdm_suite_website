
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu after clicking
      if (window.innerWidth < 1024) {
        setIsExpanded(false);
      }
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile Toggle Button - Fixed at bottom left */}
      <div className="lg:hidden fixed bottom-6 left-6 z-40">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="shadow-lg rounded-full h-14 w-14 p-0"
          size="lg"
          variant="secondary"
        >
          <List className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Overlay Menu */}
      {isExpanded && (
        <div className="lg:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Table of Contents</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-3">
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  onClick={() => handleClick(heading.id)}
                  className={cn(
                    'block w-full text-left text-base hover:text-primary transition-colors py-2 px-3 rounded-lg',
                    heading.level === 2 && 'pl-3 font-medium',
                    heading.level === 3 && 'pl-6',
                    heading.level > 3 && 'pl-9 text-sm',
                    activeId === heading.id
                      ? 'text-primary bg-primary/10 font-semibold'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {heading.text}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block sticky top-24">
        <div className="border rounded-lg p-5 bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <List className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">
              Table of Contents
            </h3>
          </div>
          <nav className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => handleClick(heading.id)}
                className={cn(
                  'block w-full text-left text-sm hover:text-primary transition-colors py-1.5 px-2 rounded',
                  heading.level === 2 && 'pl-2 font-medium',
                  heading.level === 3 && 'pl-4',
                  heading.level > 3 && 'pl-6 text-xs',
                  activeId === heading.id
                    ? 'text-primary bg-primary/10 font-semibold'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
