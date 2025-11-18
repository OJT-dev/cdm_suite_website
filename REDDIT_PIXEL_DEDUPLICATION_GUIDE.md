# Reddit Pixel Deduplication Implementation Guide

## Overview
This guide documents the implementation of Reddit Pixel conversion deduplication using unique conversion IDs. This prevents duplicate conversions from being counted when using both the Reddit Pixel and Conversion API.

## What is Deduplication?
Deduplication ensures that the same conversion event is not counted multiple times. When using both the Reddit Pixel (client-side) and Conversion API (server-side), the same event could be tracked twice. Unique conversion IDs prevent this.

## Implementation Details

### 1. Core Tracking Library (`lib/reddit-tracking.ts`)

#### New Function: `generateConversionId()`
```typescript
export function generateConversionId(eventType: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${eventType}-${timestamp}-${random}`;
}
```
Generates unique conversion IDs in the format: `{eventType}-{timestamp}-{random}`

#### Updated Tracking Functions
All tracking functions now support an optional `conversionId` parameter:
- `trackRedditEvent()` - Automatically generates conversionId if not provided
- `trackRedditSignup()` - Uses user ID or generates unique ID
- `trackRedditLead()` - Generates unique ID for each lead
- `trackRedditPurchase()` - Uses transaction ID as conversionId

### 2. Signup Form (`components/auth/signup-form.tsx`)
```typescript
// Track signup conversion with unique conversionId for deduplication
trackRedditSignup(data.userId, formData.email, `signup-${data.userId}`);
```
- Uses user ID to create a unique, consistent conversionId
- Format: `signup-{userId}`

### 3. Contact Form (`components/contact/contact-form.tsx`)
```typescript
// Track lead conversion with unique conversionId for deduplication
const conversionId = generateConversionId('contact-form');
trackRedditLead({
  email: formData.email,
  leadType: 'contact_form',
  conversionId: conversionId,
});
```
- Generates a unique ID for each form submission
- Format: `contact-form-{timestamp}-{random}`

### 4. Success Page (`app/success/page.tsx`)
```typescript
// Track purchase conversion with unique conversionId for deduplication
trackRedditPurchase({
  value: 0,
  currency: 'USD',
  transactionId: sessionId,
  conversionId: sessionId, // Use sessionId as conversionId
});
```
- Uses Stripe session ID as the conversionId
- Ensures each transaction has a unique, trackable ID

### 5. Analytics Library (`lib/analytics.ts`)
Updated to pass conversionIds through to Reddit tracking:
```typescript
conversionId: additionalProperties?.conversionId || additionalProperties?.transactionId
```

## Conversion ID Format Examples

| Event Type | Format | Example |
|-----------|--------|---------|
| Signup | `signup-{userId}` | `signup-clx1abc123` |
| Contact Form | `contact-form-{timestamp}-{random}` | `contact-form-1698765432-abc7def` |
| Purchase | `{sessionId}` | `cs_test_a1b2c3d4e5f6g7h8` |

## Benefits

1. **Prevents Double-Counting**: Same conversion won't be tracked twice
2. **Accurate Attribution**: Clean data for campaign analysis
3. **Cost Efficiency**: Pay only for unique conversions
4. **Better Insights**: Reliable conversion data for optimization

## Testing

### How to Verify Deduplication is Working

1. **Check Browser Console**:
   - Look for log messages: `Reddit Pixel: Tracked {EventName} with conversionId: {id}`
   - Verify each event has a unique conversionId

2. **Reddit Events Manager**:
   - Go to Reddit Ads Manager → Events → Event History
   - Verify conversions show unique IDs
   - Check that duplicate events are not appearing

3. **Test Scenarios**:
   - Sign up a new user → Check for `signup-{userId}` in console
   - Submit contact form → Check for `contact-form-{timestamp}-{random}`
   - Complete a purchase → Check for session ID as conversionId

## Best Practices

1. **Use Transaction IDs for Purchases**: Always use Stripe session IDs or order IDs
2. **Use User IDs for Signups**: Consistent IDs help track user journey
3. **Generate Unique IDs for Leads**: Each form submission should have a unique ID
4. **Log Conversion IDs**: Console logs help with debugging
5. **Test in Multiple Browsers**: Ensure tracking works across different environments

## Future Enhancements

1. **Server-Side Conversion API**: Implement Reddit Conversion API for server-side tracking
2. **Webhook Integration**: Track Stripe webhooks with the same conversionIds
3. **Database Logging**: Store conversionIds in database for reconciliation
4. **Advanced Deduplication**: Implement time-based deduplication windows

## Troubleshooting

### Conversion Not Tracking
1. Check if `NEXT_PUBLIC_REDDIT_PIXEL_ID` is set in `.env`
2. Verify Reddit Pixel script is loaded (`window.rdt` exists)
3. Check browser console for error messages

### Duplicate Conversions Still Appearing
1. Verify conversionIds are unique (check console logs)
2. Ensure both client and server use the same conversionId
3. Check Reddit Events Manager for duplicate event timestamps

### Missing Conversion Data
1. Verify properties are being passed correctly
2. Check that conversionId is included in tracking call
3. Review Reddit Pixel implementation in `components/analytics/reddit-pixel.tsx`

## Related Files

- `/lib/reddit-tracking.ts` - Core tracking utilities
- `/lib/analytics.ts` - Unified analytics tracking
- `/components/analytics/reddit-pixel.tsx` - Pixel initialization
- `/components/auth/signup-form.tsx` - Signup tracking
- `/components/contact/contact-form.tsx` - Lead tracking
- `/app/success/page.tsx` - Purchase tracking

## Support

For issues or questions:
1. Check Reddit Pixel documentation: https://ads.reddit.com/help/knowledge-base/conversion-tracking
2. Review this guide and related files
3. Test in browser console with logging enabled

---

**Last Updated**: October 27, 2025
**Implementation Status**: ✅ Complete and Production-Ready
