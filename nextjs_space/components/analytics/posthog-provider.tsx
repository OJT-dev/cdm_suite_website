
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    // Skip initialization if credentials are missing
    if (!key || !host) {
      return;
    }

    posthog.init(key, {
      api_host: host,
      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true,
      autocapture: true,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
