# Reddit Conversions API - Enhanced Attribution Parameters

## Overview

The Reddit Conversions API has been enhanced with comprehensive attribution parameters including match keys, event metadata, and e-commerce tracking for maximum attribution accuracy and deduplication support.

## What's New

### Enhanced Match Keys

The implementation now captures and sends all available user identifiers to Reddit for better attribution:

- **IP Address**: Automatically extracted from request headers
- **User Agent**: Browser information for device matching
- **Screen Dimensions**: Captured from client browser for better matching
- **Email**: User email for customer matching
- **Click ID**: Reddit ad click ID from URL parameters (rdt_cid or click_id)
- **Phone Number**: Optional phone number for customer matching
- **External ID**: Your internal user ID for cross-platform tracking
- **Mobile IDs**: IDFA (iOS), AAID (Android), UUID support

### Enhanced Event Metadata

All conversion events now include comprehensive metadata:

- **Conversion ID**: Required for deduplication between Pixel and Conversions API
- **Value & Currency**: Purchase amount and currency code
- **Item Count**: Number of items in the transaction
- **Products Array**: Detailed product information including:
  - Product ID/SKU
  - Product Name
  - Product Category

## Implementation Details

### 1. Client-Side Tracking (reddit-tracking.ts)

The tracking library automatically captures:
- Screen dimensions from the browser
- Reddit click ID from URL parameters
- Generates unique conversion IDs for deduplication

```typescript
import { trackRedditEvent, trackRedditPurchase } from '@/lib/reddit-tracking';

// Simple event tracking
await trackRedditSignup('user@example.com');

// Enhanced purchase tracking
await trackRedditPurchase(99.99, 'USD', {
  email: 'user@example.com',
  phoneNumber: '+1234567890',
  itemCount: 2,
  products: [
    {
      id: 'PROD-001',
      name: 'Premium Package',
      category: 'Digital Service'
    }
  ]
});
```

### 2. Server-Side API (reddit-conversion/route.ts)

The API route automatically:
- Extracts IP address and user agent from request headers
- Builds comprehensive user data object with all match keys
- Includes event metadata for accurate attribution
- Handles deduplication via conversion_id

### 3. Stripe Webhook Integration

Purchase events are automatically tracked server-side when Stripe checkout is completed:

```typescript
// Automatically sends to Reddit when payment succeeds
{
  event_type: 'Purchase',
  value: actualPurchaseAmount,
  currency: 'USD',
  conversion_id: unique_per_transaction,
  products: [
    {
      id: stripeSessionId,
      name: packageName,
      category: 'Digital Service'
    }
  ]
}
```

## How It Works

### Deduplication Flow

1. **User clicks Reddit ad** → Reddit sets rdt_cid parameter in URL
2. **User completes action** (signup, purchase, etc.)
3. **Client-side tracking**:
   - Generates unique conversion_id
   - Tracks via Reddit Pixel with conversion_id
   - Sends to server API with same conversion_id
4. **Server-side tracking**:
   - API captures IP, user agent, screen dimensions
   - Sends to Reddit Conversions API with same conversion_id
5. **Reddit deduplicates**:
   - Uses conversion_id to identify duplicate events
   - Attributes conversion using all available match keys

### Attribution Priority

Reddit uses the following data for attribution (in priority order):
1. Click ID (rdt_cid from URL)
2. Email (hashed for privacy)
3. IP Address + User Agent
4. Screen Dimensions
5. External ID
6. Phone Number

## Environment Variables

Required environment variables:

```bash
# Public - Client-side tracking
NEXT_PUBLIC_REDDIT_PIXEL_ID=your_pixel_id

# Private - Server-side tracking
REDDIT_CONVERSION_TOKEN=your_conversion_access_token
```

## Files Modified

1. **lib/reddit-tracking.ts**
   - Added screen dimension capture
   - Added click ID extraction from URL
   - Enhanced trackRedditEvent with all parameter support
   - Updated trackRedditPurchase for e-commerce tracking

2. **app/api/analytics/reddit-conversion/route.ts**
   - Added IP address and user agent extraction
   - Implemented comprehensive user data object
   - Added metadata support (conversion_id, products, etc.)
   - Enhanced error handling

3. **app/api/stripe-webhook/route.ts**
   - Added Reddit conversion tracking on purchase completion
   - Includes actual purchase value and product details
   - Automatic conversion_id generation
   - Non-blocking tracking (won't fail webhook if tracking fails)

## Event Types Supported

- **SignUp**: User registration
- **Lead**: Form submissions, contact requests
- **Purchase**: Completed purchases with value
- **Custom**: Any custom events you define
- **PageVisit**: Page views (client-side only)
- **ViewContent**: Content views (client-side only)
- **AddToCart**: Cart additions (client-side only)

## Best Practices

1. **Always include email when available** - Best match key for attribution
2. **Use conversion_id consistently** - Critical for deduplication
3. **Track purchases server-side** - More reliable than client-side
4. **Include product details** - Better insights in Reddit Ads Manager
5. **Pass click ID** - Maintain throughout user journey for best attribution

## Monitoring

Check your Reddit Events Manager to verify:
- Events are being received
- Deduplication is working (no double-counting)
- Attribution is accurate
- Match rates are high

## Troubleshooting

If events aren't showing up:
1. Verify NEXT_PUBLIC_REDDIT_PIXEL_ID is set correctly
2. Check REDDIT_CONVERSION_TOKEN is valid and not expired
3. Look for errors in browser console (client-side)
4. Check server logs for API errors (server-side)
5. Verify Reddit Pixel is loading on the page

## Testing

Test the implementation:

```bash
# 1. Check pixel loads
- Open browser dev tools
- Look for rdt() function in console

# 2. Check events fire
- Complete a signup/purchase
- Look for POST to /api/analytics/reddit-conversion
- Check Reddit Events Manager for event

# 3. Verify deduplication
- Same conversion_id should appear in both Pixel and API events
- Reddit should only count it once
```

## Next Steps

1. Monitor attribution in Reddit Ads Manager
2. Optimize campaigns based on accurate conversion data
3. Track ROI with actual purchase values
4. Use product data for dynamic ads

---

**Implementation Date**: October 27, 2025
**Status**: ✅ Complete and Tested
