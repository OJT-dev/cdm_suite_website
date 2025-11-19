
// Reddit Pixel Tracking utilities with deduplication and enhanced attribution
// This file provides utilities for tracking Reddit Pixel events with deduplication support

/**
 * Generate a unique conversion ID for deduplication
 * Format: timestamp-random-eventType
 */
export function generateConversionId(eventType: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}-${eventType}`;
}

/**
 * Get Reddit click ID from URL parameters
 */
function getRedditClickId(): string | null {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('rdt_cid') || urlParams.get('click_id');
}

/**
 * Get screen dimensions
 */
function getScreenDimensions() {
  if (typeof window === 'undefined') return null;
  return {
    width: window.screen.width,
    height: window.screen.height,
  };
}

/**
 * Track a Reddit Pixel event with deduplication and enhanced attribution
 * This sends the event both client-side (via rdt()) and server-side (via API)
 */
export async function trackRedditEvent(
  eventType: string,
  options?: {
    customEventName?: string;
    email?: string;
    phoneNumber?: string;
    externalId?: string;
    value?: number;
    currency?: string;
    itemCount?: number;
    products?: Array<{
      id: string;
      name: string;
      category?: string;
    }>;
    conversionId?: string;
    testId?: string;
  }
) {
  try {
    // Generate conversion ID if not provided
    const conversionId = options?.conversionId || generateConversionId(eventType);
    
    // Get click ID for attribution
    const clickId = getRedditClickId();
    
    // Get screen dimensions
    const screenDimensions = getScreenDimensions();

    // Track client-side via Reddit Pixel
    if (typeof window !== 'undefined' && (window as any).rdt) {
      const eventData: any = {
        conversionId,
      };

      // Add optional parameters
      if (options?.email) eventData.email = options.email;
      if (options?.value) eventData.value = options.value;
      if (options?.currency) eventData.currency = options.currency;
      if (options?.itemCount) eventData.itemCount = options.itemCount;

      // Track the event
      if (eventType === 'custom' && options?.customEventName) {
        (window as any).rdt('track', 'Custom', {
          ...eventData,
          customEventName: options.customEventName,
        });
      } else {
        (window as any).rdt('track', eventType, eventData);
      }
    }

    // Build user data for server-side tracking
    const userData: any = {};
    
    if (options?.phoneNumber) userData.phoneNumber = options.phoneNumber;
    if (options?.externalId) userData.externalId = options.externalId;
    if (screenDimensions) {
      userData.screenWidth = screenDimensions.width;
      userData.screenHeight = screenDimensions.height;
    }

    // Track server-side via Conversions API with enhanced parameters
    const response = await fetch('/api/analytics/reddit-conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        customEventName: options?.customEventName,
        clickId,
        testId: options?.testId, // For testing events
        userData: Object.keys(userData).length > 0 ? userData : undefined,
        eventMetadata: {
          conversionId, // REQUIRED for deduplication
          email: options?.email,
          value: options?.value,
          currency: options?.currency,
          itemCount: options?.itemCount,
          products: options?.products,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server-side Reddit conversion failed:', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    const result = await response.json();
    console.log('Server-side Reddit conversion success:', result);

    return conversionId;
  } catch (error) {
    console.error('Error tracking Reddit event:', error);
    throw error; // Re-throw so calling code can handle it
  }
}

/**
 * Track a signup event
 */
export async function trackRedditSignup(email?: string): Promise<string> {
  return (await trackRedditEvent('SignUp', { email })) || '';
}

/**
 * Track a lead event (form submission)
 */
export async function trackRedditLead(email?: string): Promise<string> {
  return (await trackRedditEvent('Lead', { email })) || '';
}

/**
 * Track a purchase event with e-commerce details
 */
export async function trackRedditPurchase(
  value: number,
  currency: string = 'USD',
  options?: {
    email?: string;
    phoneNumber?: string;
    itemCount?: number;
    products?: Array<{
      id: string;
      name: string;
      category?: string;
    }>;
  }
): Promise<string> {
  return (await trackRedditEvent('Purchase', { 
    value, 
    currency, 
    email: options?.email,
    phoneNumber: options?.phoneNumber,
    itemCount: options?.itemCount,
    products: options?.products,
  })) || '';
}

/**
 * Track a custom event
 */
export async function trackRedditCustomEvent(
  eventName: string,
  email?: string
): Promise<string> {
  return (
    (await trackRedditEvent('custom', { customEventName: eventName, email })) || ''
  );
}

/**
 * Track a page view
 */
export function trackRedditPageView() {
  if (typeof window !== 'undefined' && (window as any).rdt) {
    (window as any).rdt('track', 'PageVisit');
  }
}

/**
 * Track a view content event
 */
export function trackRedditViewContent(contentName?: string) {
  if (typeof window !== 'undefined' && (window as any).rdt) {
    const eventData: any = {};
    if (contentName) eventData.itemId = contentName;
    (window as any).rdt('track', 'ViewContent', eventData);
  }
}

/**
 * Track an add to cart event
 */
export function trackRedditAddToCart(value?: number, currency: string = 'USD') {
  if (typeof window !== 'undefined' && (window as any).rdt) {
    const eventData: any = {};
    if (value) {
      eventData.value = value;
      eventData.currency = currency;
    }
    (window as any).rdt('track', 'AddToCart', eventData);
  }
}
