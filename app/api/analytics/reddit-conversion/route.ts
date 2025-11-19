
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const REDDIT_PIXEL_ID = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;
const REDDIT_CONVERSION_TOKEN = process.env.REDDIT_CONVERSION_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, customEventName, eventMetadata, userData, clickId, testId } = body;

    if (!REDDIT_PIXEL_ID || !REDDIT_CONVERSION_TOKEN) {
      console.error('Reddit Pixel ID or Conversion Token not configured');
      return NextResponse.json(
        { error: 'Reddit tracking not configured' },
        { status: 500 }
      );
    }

    // Extract IP address and user agent from request headers
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Map event types to Reddit API v3 format (uppercase with underscores)
    const eventTypeMap: Record<string, string> = {
      'SignUp': 'SIGN_UP',
      'Lead': 'LEAD',
      'Purchase': 'PURCHASE',
      'AddToCart': 'ADD_TO_CART',
      'ViewContent': 'VIEW_CONTENT',
      'PageVisit': 'PAGE_VISIT',
      'custom': 'CUSTOM',
    };

    const trackingType = eventTypeMap[eventType] || eventType.toUpperCase();

    // Prepare the event data
    const eventData: any = {
      event_at: Date.now(),
      action_source: 'WEBSITE', // Must be uppercase per Reddit API v3 docs
      type: {
        tracking_type: trackingType,
      },
    };

    console.log(`Preparing Reddit event: ${eventType} -> ${trackingType}`);

    // Add custom event name if it's a custom event
    if (eventType === 'custom' && customEventName) {
      eventData.type.custom_event_name = customEventName;
    }

    // Add click ID if available (for attribution)
    if (clickId) {
      eventData.click_id = clickId;
    }

    // Build user data object with match keys
    const userDataObj: any = {
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    // Add email if provided (hashed on server for privacy)
    if (eventMetadata?.email) {
      userDataObj.email = eventMetadata.email;
    }

    // Add phone number if provided
    if (userData?.phoneNumber) {
      userDataObj.phone_number = userData.phoneNumber;
    }

    // Add external ID if provided
    if (userData?.externalId) {
      userDataObj.external_id = userData.externalId;
    }

    // Add screen dimensions if provided
    if (userData?.screenWidth && userData?.screenHeight) {
      userDataObj.screen_dimensions = {
        width: userData.screenWidth,
        height: userData.screenHeight,
      };
    }

    // Add mobile advertising IDs if provided
    if (userData?.idfa) {
      userDataObj.idfa = userData.idfa;
    }
    if (userData?.aaid) {
      userDataObj.aaid = userData.aaid;
    }
    if (userData?.uuid) {
      userDataObj.uuid = userData.uuid;
    }

    eventData.user = userDataObj;

    // Add event metadata
    const metadata: any = {};

    // Add conversion_id for deduplication (REQUIRED when using both Pixel and Conversions API)
    if (eventMetadata?.conversionId) {
      metadata.conversion_id = eventMetadata.conversionId;
    }

    // Add value and currency for conversion tracking
    // NOTE: These go in metadata ONLY, not at the top level
    if (eventMetadata?.value !== undefined) {
      metadata.value = eventMetadata.value;
    }

    if (eventMetadata?.currency) {
      metadata.currency = eventMetadata.currency;
    }

    // Add item count
    if (eventMetadata?.itemCount) {
      metadata.item_count = eventMetadata.itemCount;
    }

    // Add products array
    if (eventMetadata?.products && Array.isArray(eventMetadata.products)) {
      metadata.products = eventMetadata.products.map((product: any) => ({
        id: product.id || product.sku,
        name: product.name || product.title,
        category: product.category || product.productGroup,
      }));
    }

    // Only add metadata if it has properties
    if (Object.keys(metadata).length > 0) {
      eventData.metadata = metadata;
    }

    // Build the API URL with optional test_id query parameter
    const apiUrl = new URL(`https://ads-api.reddit.com/api/v3/pixels/${REDDIT_PIXEL_ID}/conversion_events`);
    if (testId) {
      apiUrl.searchParams.append('test_id', testId);
    }

    const payload = {
      data: {
        events: [eventData],
      },
    };

    console.log('Sending to Reddit API:', apiUrl.toString());
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Send to Reddit Conversions API
    const response = await fetch(
      apiUrl.toString(),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REDDIT_CONVERSION_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reddit Conversions API error:', response.status, errorText);

      let errorMessage = 'Failed to send conversion event';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorText;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          status: response.status,
          details: errorText
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Reddit API Success Response:', JSON.stringify(result, null, 2));
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error sending Reddit conversion:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
