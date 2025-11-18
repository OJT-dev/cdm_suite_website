
'use client';

import { useEffect } from 'react';

export default function ClarityInit() {
  useEffect(() => {
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    
    if (!clarityId) {
      // Skip initialization if credentials are missing
      return;
    }

    if (typeof window !== 'undefined') {
      // TypeScript-friendly Clarity initialization
      const w = window as any;
      const d = document;
      
      w.clarity = w.clarity || function() {
        (w.clarity.q = w.clarity.q || []).push(arguments);
      };
      
      const script = d.createElement('script');
      script.async = true;
      script.src = 'https://www.clarity.ms/tag/' + clarityId;
      
      const firstScript = d.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      }
    }
  }, []);

  return null;
}
