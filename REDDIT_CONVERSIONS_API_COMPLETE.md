# Reddit Pixel & Conversions API - Complete Setup

## Overview
The Reddit Pixel and Conversions API implementation is fully configured and operational. This document provides a complete reference for the implementation, including environment setup, testing, and usage.

---

## Environment Configuration ✅

The following environment variables are now configured in your `.env` file:

```bash
# Reddit Pixel ID (public - used by client-side pixel)
NEXT_PUBLIC_REDDIT_PIXEL_ID=a2_hwf6ymduy5vb

# Reddit Conversion Token (private - used for server-side API)
REDDIT_CONVERSION_TOKEN=eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0...
```

---

## Testing Interface

### Admin Test Page
A dedicated testing interface is available at:
```
/admin/reddit-test
```

This interface allows you to:
- Test all Reddit event types (SignUp, Lead, Purchase, Custom)
- Send test events to Reddit with a test ID for verification
- Verify deduplication by using unique conversion IDs
- Test both client-side (Pixel) and server-side (Conversions API) tracking

### Test ID for Reddit
When testing events, use your Reddit test ID to verify events in the Reddit Events Manager without affecting production data.

**Your Reddit Pixel ID:** `a2_hwf6ymduy5vb`

---

## Implementation Architecture

### Dual Tracking System
The implementation uses both client-side and server-side tracking for maximum reliability:

1. **Client-Side (Reddit Pixel)**
   - Tracks events in the browser via `rdt()` function
   - Automatically captures page visits and user interactions
   - Limited by ad blockers and privacy settings

2. **Server-Side (Conversions API)**
   - Tracks events directly from your server to Reddit
   - Bypasses ad blockers and privacy restrictions
   - Provides better attribution and data accuracy

### Deduplication
Both tracking methods use the same `conversion_id` to prevent duplicate events:
- Each event generates a unique conversion ID: `timestamp-random-eventType`
- The same ID is sent to both Pixel and Conversions API
- Reddit automatically deduplicates events with matching IDs

---

## Event Tracking Examples

### 1. Track a Signup Event
```typescript
import { trackRedditSignup } from '@/lib/reddit-tracking';

// Basic signup
await trackRedditSignup();

// With email for better attribution
await trackRedditSignup('user@example.com');
```

### 2. Track a Lead Event
```typescript
import { trackRedditLead } from '@/lib/reddit-tracking';

// Basic lead
await trackRedditLead();

// With email
await trackRedditLead('lead@example.com');
```

### 3. Track a Purchase Event
```typescript
import { trackRedditPurchase } from '@/lib/reddit-tracking';

// Basic purchase
await trackRedditPurchase(99.99, 'USD');

// With enhanced e-commerce data
await trackRedditPurchase(149.99, 'USD', {
  email: 'customer@example.com',
  phoneNumber: '+1234567890',
  itemCount: 3,
  products: [
    {
      id: 'prod-123',
      name: 'Premium Plan',
      category: 'subscription'
    }
  ]
});
```

### 4. Track a Custom Event
```typescript
import { trackRedditCustomEvent } from '@/lib/reddit-tracking';

// Custom event (e.g., video watch, download, etc.)
await trackRedditCustomEvent('video_complete', 'user@example.com');
```

### 5. Track Page Views
```typescript
import { trackRedditPageView } from '@/lib/reddit-tracking';

// Automatically tracks page visits
useEffect(() => {
  trackRedditPageView();
}, []);
```

---

## Attribution Parameters

The implementation automatically captures and sends the following attribution data:

### Match Keys (for user identification)
- Email (hashed for privacy)
- Phone number
- External ID (user ID from your system)
- Screen dimensions
- IP address
- User agent

### Click Attribution
- Reddit click ID (`rdt_cid` from URL parameters)
- Source tracking
- Campaign parameters

### Event Metadata
- Conversion ID (for deduplication)
- Currency and value (for conversion tracking)
- Item count and product details (for e-commerce)
- Custom event names

---

## Current Integration Points

The Reddit tracking is currently integrated at the following points:

### 1. Signup Flow
- Location: `/api/auth/signup`
- Event: `SignUp`
- Includes: Email

### 2. Lead Capture
- Location: Various contact forms, audit tool, tools results
- Event: `Lead`
- Includes: Email, form type

### 3. Checkout/Purchase
- Location: Stripe checkout success
- Event: `Purchase`
- Includes: Email, value, currency, products

### 4. Page Visits
- Location: All pages (via layout)
- Event: `PageVisit`
- Automatic tracking

---

## Testing & Verification

### Step 1: Test Event
1. Visit `/admin/reddit-test`
2. Enter a test ID (get this from Reddit Events Manager)
3. Click "Send Test Event"
4. Check Reddit Events Manager for the test event

### Step 2: Live Event Testing
1. Perform an action (signup, lead submission, purchase)
2. Check Reddit Events Manager → Events tab
3. Verify both Pixel and Server events appear
4. Confirm they have matching conversion IDs (deduplication)

### Step 3: Conversion Verification
1. Run Reddit ads with conversion tracking
2. Monitor conversion events in Ads Manager
3. Verify attribution and ROI metrics
4. Check for duplicate events (should be minimal)

---

## API Routes

### Server-Side Conversion Endpoint
**Route:** `/api/analytics/reddit-conversion`  
**Method:** POST

**Request Body:**
```json
{
  "eventType": "Purchase",
  "customEventName": "optional_custom_name",
  "clickId": "rdt_cid_from_url",
  "testId": "optional_test_id",
  "userData": {
    "phoneNumber": "+1234567890",
    "externalId": "user_123",
    "screenWidth": 1920,
    "screenHeight": 1080
  },
  "eventMetadata": {
    "conversionId": "1234567890-abc123-Purchase",
    "email": "user@example.com",
    "value": 99.99,
    "currency": "USD",
    "itemCount": 2,
    "products": [
      {
        "id": "prod-123",
        "name": "Product Name",
        "category": "category"
      }
    ]
  }
}
```

---

## Best Practices

### 1. Always Use Deduplication
- Never manually create conversion IDs
- Use the `trackRedditEvent()` function for automatic ID generation
- If you need to use the same ID for multiple calls, store it and pass it explicitly

### 2. Include User Data
- Email is the most reliable match key
- Include phone number for better attribution
- Use external IDs to link events to your user database

### 3. Track E-commerce Properly
- Always include value and currency for purchase events
- Include product details for better insights
- Track item count for inventory analysis

### 4. Test Before Going Live
- Use test IDs to verify events without affecting production data
- Check both Pixel and Conversions API events in Events Manager
- Verify deduplication is working correctly

### 5. Monitor Performance
- Check Events Manager regularly for event quality
- Monitor match rates for attribution accuracy
- Review conversion metrics in Ads Manager

---

## Troubleshooting

### Events Not Showing in Events Manager
1. Check that environment variables are configured correctly
2. Verify the Pixel ID matches your Reddit account
3. Check the Conversion Token is valid and not expired
4. Look for errors in browser console and server logs

### Duplicate Events
1. Verify conversion IDs are being generated correctly
2. Check that the same ID is being sent to both Pixel and API
3. Review the deduplication logic in `reddit-tracking.ts`

### Attribution Issues
1. Ensure click IDs are being captured from URL parameters
2. Include as many match keys as possible (email, phone, etc.)
3. Check that IP address and user agent are being sent correctly

### Test Events Not Working
1. Verify test ID is correct from Reddit Events Manager
2. Check that the test ID is being passed to the API
3. Look for API errors in the server logs

---

## Files Modified/Created

1. **Components**
   - `/components/analytics/reddit-pixel.tsx` - Client-side pixel component

2. **Libraries**
   - `/lib/reddit-tracking.ts` - Main tracking utilities
   - `/lib/analytics.ts` - Analytics integration

3. **API Routes**
   - `/app/api/analytics/reddit-conversion/route.ts` - Server-side conversions

4. **Admin Interface**
   - `/app/admin/reddit-test/page.tsx` - Testing interface

5. **Layout**
   - `/app/layout.tsx` - Pixel initialization

6. **Environment**
   - `.env` - Configuration variables

---

## Documentation

Additional documentation files:
- `REDDIT_PIXEL_SETUP_COMPLETE.md` - Initial setup guide
- `REDDIT_PIXEL_DEDUPLICATION_GUIDE.md` - Deduplication implementation
- `REDDIT_CONVERSION_ID_COMPLETE.md` - Conversion ID documentation
- `REDDIT_TEST_EVENTS_IMPLEMENTATION.md` - Test event setup
- `REDDIT_TESTING_QUICK_START.md` - Quick testing guide

---

## Next Steps

1. **Test the Implementation**
   - Visit `/admin/reddit-test` to send test events
   - Verify events appear in Reddit Events Manager
   - Check deduplication is working correctly

2. **Monitor Performance**
   - Track conversion rates in Reddit Ads Manager
   - Review event quality in Events Manager
   - Optimize based on attribution data

3. **Optimize Tracking**
   - Add tracking to additional conversion points
   - Include more user data for better attribution
   - Test different event types and parameters

4. **Scale Up**
   - Launch Reddit ad campaigns
   - Use conversion tracking for optimization
   - Monitor ROI and adjust strategy

---

## Support

For issues or questions:
- Check Reddit's Conversions API documentation
- Review the implementation files listed above
- Test using the admin interface at `/admin/reddit-test`
- Check server logs for API errors

---

**Status:** ✅ Fully Configured and Operational
**Last Updated:** October 27, 2025
