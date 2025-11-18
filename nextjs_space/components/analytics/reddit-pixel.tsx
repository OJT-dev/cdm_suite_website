
'use client';

import { useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    rdt?: (command: string, ...args: any[]) => void;
  }
}

function RedditPixelInner() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize Reddit Pixel
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;
    
    if (!pixelId) {
      // Skip initialization if pixel ID is missing
      return;
    }

    if (typeof window !== 'undefined' && !window.rdt) {
      // Initialize Reddit Pixel
      const w = window as any;
      const d = document;
      
      if (!w.rdt) {
        const p: any = (w.rdt = function () {
          p.sendEvent
            ? p.sendEvent.apply(p, arguments)
            : p.callQueue.push(arguments);
        });
        p.callQueue = [];
        
        const t = d.createElement('script');
        t.src = 'https://www.redditstatic.com/ads/pixel.js';
        t.async = true;
        
        const s = d.getElementsByTagName('script')[0];
        if (s && s.parentNode) {
          s.parentNode.insertBefore(t, s);
        }
      }

      // Initialize with or without user data
      if (session?.user?.email) {
        w.rdt('init', pixelId, {
          email: session.user.email,
          externalId: session.user.id,
        });
      } else {
        w.rdt('init', pixelId);
      }

      // Track initial page visit
      w.rdt('track', 'PageVisit');
    }
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;
    
    if (!pixelId || typeof window === 'undefined' || !window.rdt) {
      return;
    }

    window.rdt('track', 'PageVisit');
  }, [pathname, searchParams]);

  // Update user identity when session changes
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;
    
    if (!pixelId || typeof window === 'undefined' || !window.rdt) {
      return;
    }

    if (session?.user?.email) {
      // Re-initialize with user data
      window.rdt('init', pixelId, {
        email: session.user.email,
        externalId: session.user.id,
      });
    }
  }, [session]);

  return null;
}

export default function RedditPixel() {
  return (
    <Suspense fallback={null}>
      <RedditPixelInner />
    </Suspense>
  );
}
