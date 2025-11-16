
# Reddit Conversions API Test Events - Complete Implementation

## 🎯 Objective Completed
**Task:** Implement full support for Reddit test events with `test_id` parameter to verify Conversions API integration.

**Status:** ✅ **FULLY IMPLEMENTED AND OPERATIONAL**

---

## 📋 What Was Implemented

### 1. Test ID Parameter Support

Added `test_id` parameter support throughout the entire tracking stack:

- ✅ **API Endpoint** - Accepts and forwards test_id to Reddit
- ✅ **Tracking Library** - Supports testId in all tracking functions
- ✅ **Test Interface** - Admin page for sending test events

### 2. Reddit Test Events Page

**Location:** `/admin/reddit-test`

A comprehensive testing interface that allows you to:
- Send test events with the provided test ID: `t2_20lcxjcqah`
- Test different event types (SignUp, Lead, Purchase, etc.)
- View real-time results and responses
- Test both full tracking flow and API-only mode

---

## 🔑 Key Features

### Test Event Interface

The test page at `/admin/reddit-test` provides:

1. **Test ID Configuration**
   - Pre-populated with your test ID: `t2_20lcxjcqah`
   - Can be cleared for production testing
   - Fully editable

2. **Event Type Selection**
   - SignUp
   - Lead
   - Purchase
   - AddToCart
   - ViewContent
   - Custom Events

3. **Test Data Input**
   - Email (for match key testing)
   - Value and Currency (for Purchase/AddToCart)
   - Custom event names

4. **Two Testing Modes**
   - **Full Flow:** Sends via tracking library (client + server)
   - **API Only:** Direct API call for testing

5. **Real-Time Results**
   - Success/error messages
   - Full response payload display
   - Conversion ID tracking

---

## 🔧 Technical Implementation

### 1. API Endpoint Enhancement

**File:** `/app/api/analytics/reddit-conversion/route.ts`

```typescript
// Extract testId from request body
const { eventType, customEventName, eventMetadata, userData, clickId, testId } = body;

// Add test_id to event data if provided
const eventData: any = {
  event_at: Date.now(),
  action_source: 'web',
  type: {
    tracking_type: eventType === 'custom' ? 'CUSTOM' : eventType,
  },
};

// Add test_id if provided (for testing events)
if (testId) {
  eventData.test_id = testId;
}
```

**What It Does:**
- Receives `testId` from client
- Adds `test_id` field to event payload
- Forwards to Reddit Conversions API
- Events with test_id appear in Reddit's Test Events panel

### 2. Tracking Library Update

**File:** `/lib/reddit-tracking.ts`

```typescript
export async function trackRedditEvent(
  eventType: string,
  options?: {
    // ... existing options
    testId?: string; // NEW: Support for test ID
  }
) {
  // Track server-side via Conversions API
  await fetch('/api/analytics/reddit-conversion', {
    method: 'POST',
    body: JSON.stringify({
      eventType,
      testId: options?.testId, // NEW: Include test ID
      eventMetadata: { /* ... */ },
    }),
  });
}
```

**What It Does:**
- Accepts `testId` as optional parameter
- Passes testId to API endpoint
- All existing tracking functions support testId

---

## 🧪 How to Test

### Step-by-Step Testing Guide

1. **Navigate to Test Page**
   - URL: `https://cdmsuite.com/admin/reddit-test`
   - Or: `http://localhost:3000/admin/reddit-test` (development)

2. **Configure Test Event**
   ```
   Test ID: t2_20lcxjcqah (pre-filled)
   Event Type: SignUp (or any other)
   Email: test@example.com
   ```

3. **Send Test Event**
   - Click "Send Test Event (Full Flow)"
   - Wait for confirmation message
   - Note the conversion_id returned

4. **Verify in Reddit**
   - Go to Reddit Ads Manager
   - Navigate to: Pixels → Your Pixel → Test Events
   - Look for the event with matching test_id
   - Should appear within 1-2 minutes

5. **Check Event Details**
   - Verify event_type matches
   - Check conversion_id is present
   - Confirm email/metadata included
   - Validate timestamp

---

## 📊 Test Event Payload Example

### Request Sent to Reddit

```json
{
  "data": {
    "events": [{
      "event_at": 1730062800000,
      "action_source": "web",
      "test_id": "t2_20lcxjcqah",
      "type": {
        "tracking_type": "SignUp"
      },
      "user": {
        "email": "test@example.com",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0..."
      },
      "metadata": {
        "conversion_id": "1730062800-x1y2z3-SignUp"
      }
    }]
  }
}
```

### What Reddit Receives

- ✅ **test_id:** `t2_20lcxjcqah`
- ✅ **event_type:** SignUp
- ✅ **conversion_id:** Unique ID for deduplication
- ✅ **user data:** Email, IP, User Agent
- ✅ **timestamp:** Event occurrence time

---

## 🎯 Test vs Production Mode

### With Test ID (`test_id` present)

```typescript
// Test mode - events appear in Test Events panel
trackRedditEvent('SignUp', {
  email: 'test@example.com',
  testId: 't2_20lcxjcqah' // TEST MODE
});
```

**Result:**
- ✅ Event sent to Reddit
- ✅ Appears in Test Events panel
- ✅ NOT counted in production metrics
- ✅ Can be verified immediately

### Without Test ID (Production)

```typescript
// Production mode - events counted in real metrics
trackRedditEvent('SignUp', {
  email: 'user@example.com'
  // NO testId = PRODUCTION
});
```

**Result:**
- ✅ Event sent to Reddit
- ✅ Counted in production conversions
- ✅ Affects campaign performance data
- ✅ Cannot be undone

---

## 📈 Verification Checklist

### Before Testing
- [ ] Environment variables set (REDDIT_PIXEL_ID, REDDIT_CONVERSION_TOKEN)
- [ ] Test page accessible at `/admin/reddit-test`
- [ ] Test ID available: `t2_20lcxjcqah`

### During Testing
- [ ] Test event form loads correctly
- [ ] All event types selectable
- [ ] Test ID field pre-populated
- [ ] "Send Test Event" button works
- [ ] Success message appears
- [ ] Response payload displayed

### After Testing (Reddit Ads Manager)
- [ ] Navigate to Pixels → Test Events
- [ ] Test event appears in list
- [ ] Event type matches what was sent
- [ ] conversion_id present
- [ ] Email/metadata included
- [ ] Timestamp is correct

---

## 🔍 Testing Different Event Types

### 1. SignUp Event
```
Event Type: SignUp
Email: signup@test.com
Test ID: t2_20lcxjcqah
```

### 2. Lead Event
```
Event Type: Lead
Email: lead@test.com
Test ID: t2_20lcxjcqah
```

### 3. Purchase Event
```
Event Type: Purchase
Email: buyer@test.com
Value: 99.00
Currency: USD
Test ID: t2_20lcxjcqah
```

### 4. Custom Event
```
Event Type: custom
Custom Name: MyTestEvent
Email: custom@test.com
Test ID: t2_20lcxjcqah
```

---

## 🛠️ Troubleshooting

### Test Event Not Appearing in Reddit

**Possible Causes:**
1. Test ID incorrect or missing
2. API credentials not configured
3. Network/firewall blocking request
4. Reddit API temporary issue

**Solutions:**
1. Verify test ID: `t2_20lcxjcqah`
2. Check `.env.local` for:
   - `NEXT_PUBLIC_REDDIT_PIXEL_ID`
   - `REDDIT_CONVERSION_TOKEN`
3. Check browser console for errors
4. Check server logs for API responses
5. Wait 2-5 minutes and refresh Reddit dashboard

### Error: "Failed to send conversion event"

**Check:**
1. API credentials are correct
2. Reddit Conversion Token is valid
3. Pixel ID matches your Reddit account
4. Network allows outbound HTTPS to Reddit API

### Event Appears But Missing Data

**Verify:**
1. All form fields filled correctly
2. Email format is valid
3. Value/currency for Purchase events
4. conversion_id generated (check logs)

---

## 📝 API Response Examples

### Success Response
```json
{
  "success": true,
  "result": {
    "data": {
      "events": [
        {
          "status": "received",
          "event_id": "evt_123abc"
        }
      ]
    }
  }
}
```

### Error Response
```json
{
  "error": "Failed to send conversion event",
  "details": "Invalid access token"
}
```

---

## 🎓 Best Practices

### 1. Always Use Test ID During Development
```typescript
// Development/Testing
const testId = process.env.NODE_ENV === 'development' 
  ? 't2_20lcxjcqah' 
  : undefined;

trackRedditEvent('SignUp', { email, testId });
```

### 2. Remove Test ID for Production
```typescript
// Production only
trackRedditEvent('SignUp', { 
  email 
  // No testId = production event
});
```

### 3. Monitor Test Events Regularly
- Check test events before launching campaigns
- Verify deduplication working correctly
- Ensure all required data present
- Test all event types used in production

### 4. Document Test Results
- Keep record of test event IDs
- Note any issues encountered
- Track changes to tracking implementation
- Share results with team

---

## 📚 Related Documentation

1. **REDDIT_PIXEL_SETUP_COMPLETE.md** - Initial pixel setup
2. **REDDIT_CONVERSIONS_API_COMPLETE.md** - Server-side API setup
3. **REDDIT_CONVERSION_ID_VERIFICATION.md** - Deduplication verification
4. **REDDIT_CONVERSION_ID_COMPLETE.md** - Conversion ID implementation
5. **REDDIT_TEST_EVENTS_IMPLEMENTATION.md** - This document

---

## 🚀 Summary

### What You Can Do Now

✅ **Send test events** via `/admin/reddit-test` page
✅ **Verify tracking** before launching campaigns
✅ **Test deduplication** with matching conversion IDs
✅ **Debug issues** with real-time feedback
✅ **Validate data** sent to Reddit Conversions API

### Test ID Provided
```
t2_20lcxjcqah
```

### Test Page URL
```
https://cdmsuite.com/admin/reddit-test
```

### Expected Timeline
- **Send test event:** Instant
- **API response:** 1-3 seconds
- **Reddit dashboard:** 1-2 minutes

---

## ✅ Implementation Status

**Status:** ✅ **PRODUCTION READY**

All Reddit test event functionality is implemented and operational:

- ✅ Test ID parameter support in API
- ✅ Test ID support in tracking library
- ✅ Admin test interface created
- ✅ Full event type coverage
- ✅ Real-time feedback and results
- ✅ Documentation complete

**Last Updated:** October 27, 2025  
**Test ID:** `t2_20lcxjcqah`  
**Test Page:** `/admin/reddit-test`

---

## 🎉 Ready to Test!

Your Reddit Conversions API test events implementation is complete. You can now:

1. **Navigate to:** `https://cdmsuite.com/admin/reddit-test`
2. **Use Test ID:** `t2_20lcxjcqah`
3. **Send test events** and verify in Reddit Ads Manager
4. **Validate** your entire tracking setup before going live

All test events will appear in Reddit's Test Events panel and won't affect your production conversion metrics!
