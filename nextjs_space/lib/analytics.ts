
/**
 * Analytics tracking utilities
 * Centralized functions for tracking events across all analytics platforms
 * Includes both client-side and server-side tracking for Reddit Conversions API
 */

import posthog from 'posthog-js';
import { 
  trackRedditEvent, 
  trackRedditSignup,
  trackRedditLead,
  trackRedditPurchase,
  trackRedditPageView,
  generateConversionId 
} from './reddit-tracking';

/**
 * Track a custom event across all analytics platforms
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // PostHog
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (posthogKey && !posthogKey.startsWith('phc_XXXX')) {
    posthog.capture(eventName, properties);
  }

  // Google Analytics
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (gaId && gaId !== 'G-XXXXXXXXXX' && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }

  // Reddit Pixel - track as custom event (client-side only for non-conversion events)
  const redditPixelId = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;
  if (redditPixelId && typeof window !== 'undefined' && (window as any).rdt) {
    (window as any).rdt('track', 'Custom', {
      customEventName: eventName,
      ...properties,
    });
  }
}

/**
 * Track a page view (manual tracking)
 */
export function trackPageView(url: string, title?: string) {
  const properties = { url, title };

  // PostHog
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (posthogKey && !posthogKey.startsWith('phc_XXXX')) {
    posthog.capture('$pageview', properties);
  }

  // Google Analytics
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (gaId && gaId !== 'G-XXXXXXXXXX' && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', gaId, {
      page_path: url,
      page_title: title,
    });
  }
}

/**
 * Identify a user across analytics platforms
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  // PostHog
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (posthogKey && !posthogKey.startsWith('phc_XXXX')) {
    posthog.identify(userId, properties);
  }

  // Google Analytics
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (gaId && gaId !== 'G-XXXXXXXXXX' && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', gaId, {
      user_id: userId,
    });
  }
}

/**
 * Track a conversion/goal
 * Includes both client-side and server-side tracking
 */
export async function trackConversion(
  conversionName: string, 
  value?: number, 
  currency?: string,
  additionalProperties?: Record<string, any>
) {
  const properties: Record<string, any> = { 
    conversion: conversionName,
    ...additionalProperties 
  };
  
  if (value !== undefined) {
    properties.value = value;
  }
  
  if (currency) {
    properties.currency = currency || 'USD';
  }

  // Track in PostHog & GA
  trackEvent('conversion', properties);

  // Track specific Reddit events based on conversion type with deduplication
  // Now includes both client-side and server-side tracking via Conversions API
  const redditPixelId = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;
  if (redditPixelId) {
    if (conversionName.toLowerCase().includes('purchase') || conversionName.toLowerCase().includes('payment')) {
      await trackRedditPurchase(
        value || 0,
        currency || 'USD',
        additionalProperties?.email
      );
    } else if (conversionName.toLowerCase().includes('lead') || conversionName.toLowerCase().includes('contact')) {
      await trackRedditLead(additionalProperties?.email);
    } else if (conversionName.toLowerCase().includes('signup') || conversionName.toLowerCase().includes('register')) {
      await trackRedditSignup(additionalProperties?.email);
    }
  }
}

/**
 * Reset user identity (logout)
 */
export function resetUser() {
  // PostHog
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (posthogKey && !posthogKey.startsWith('phc_XXXX')) {
    posthog.reset();
  }
}
