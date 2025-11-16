
# Reddit Test Events - Quick Start Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Open Test Page
Navigate to: **https://cdmsuite.com/admin/reddit-test**

### Step 2: Configure Test Event
```
Test ID: t2_20lcxjcqah (already filled)
Event Type: SignUp (or choose any)
Email: test@example.com
```

### Step 3: Send and Verify
1. Click "Send Test Event (Full Flow)"
2. Wait for success message
3. Go to Reddit Ads Manager → Pixels → Test Events
4. Your test event should appear within 1-2 minutes

---

## 📋 Event Types You Can Test

- ✅ **SignUp** - User registration
- ✅ **Lead** - Form submission (contact, etc.)
- ✅ **Purchase** - Completed transaction
- ✅ **AddToCart** - Item added to cart
- ✅ **ViewContent** - Page/product view
- ✅ **Custom** - Your custom events

---

## 🎯 What Gets Sent

Every test event includes:
- **test_id:** `t2_20lcxjcqah`
- **conversion_id:** Unique ID for deduplication
- **event_type:** SignUp, Lead, Purchase, etc.
- **user_data:** Email, IP address, User Agent
- **metadata:** Value, currency (for Purchase)

---

## ✅ Verification

### In Your Test Page
- ✅ Success message appears
- ✅ Conversion ID displayed
- ✅ Response payload shown

### In Reddit Ads Manager
1. Navigate to **Pixels** section
2. Click on your **Pixel**
3. Go to **Test Events** tab
4. Look for event with test_id: `t2_20lcxjcqah`
5. Should appear within **1-2 minutes**

---

## 🔄 Test vs Production

### Test Mode (With test_id)
```typescript
testId: 't2_20lcxjcqah'
```
- Events appear in Test Events panel
- NOT counted in production metrics
- Safe to test repeatedly

### Production Mode (Without test_id)
```typescript
testId: undefined // or leave empty
```
- Events counted in real conversions
- Affect campaign performance
- Use only for live traffic

---

## 💡 Tips

1. **Test all event types** you plan to use
2. **Verify deduplication** by checking conversion_id
3. **Monitor Test Events** panel regularly
4. **Remove test_id** before going live
5. **Keep test_id** for ongoing QA testing

---

## 🆘 Troubleshooting

### Event not appearing?
- Wait 2-5 minutes and refresh
- Check browser console for errors
- Verify test_id is correct
- Confirm API credentials in .env

### Getting errors?
- Check Reddit Conversion Token is valid
- Verify Pixel ID matches your account
- Ensure network allows HTTPS to Reddit API

---

## 📖 Full Documentation

For detailed information, see:
- **REDDIT_TEST_EVENTS_IMPLEMENTATION.md** - Complete guide
- **REDDIT_CONVERSIONS_API_COMPLETE.md** - API setup
- **REDDIT_CONVERSION_ID_VERIFICATION.md** - Deduplication

---

## 🎉 Ready!

Your test ID: **t2_20lcxjcqah**  
Your test page: **https://cdmsuite.com/admin/reddit-test**  

Start testing now! 🚀
