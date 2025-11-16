
# Analytics Setup Guide

This guide will help you configure **Google Analytics 4**, **Microsoft Clarity**, and **PostHog** for your CDM Suite application.

## 🎯 Overview

Your app is now equipped with three powerful analytics platforms:

1. **Google Analytics 4 (GA4)** - Website traffic, user behavior, conversions
2. **Microsoft Clarity** - Heatmaps, session recordings, user experience insights
3. **PostHog** - Product analytics, feature flags, A/B testing, funnels

## 📋 Current Status

✅ All analytics code has been integrated
⚠️ **Action Required**: You need to replace placeholder IDs with your actual credentials

## 🔧 Setup Instructions

### 1. Google Analytics 4 (GA4)

#### Create Your GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in bottom left)
3. Under **Property**, click **Create Property**
4. Follow the setup wizard:
   - Enter your website name
   - Select your timezone and currency
   - Click **Create**
5. Click **Data Streams** → **Add stream** → **Web**
6. Enter your website URL (e.g., `https://cdmsuite.abacusai.app`)
7. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

#### Add to Your App

Replace the placeholder in your `.env.local` file:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR_ACTUAL_ID
```

#### What GA4 Tracks

- Page views
- User sessions
- Traffic sources
- Conversions and goals
- User demographics
- Device information

#### Verify Setup

1. Visit your website after deployment
2. Go to GA4 → **Reports** → **Realtime**
3. You should see active users

---

### 2. Microsoft Clarity

#### Create Your Clarity Project

1. Go to [Microsoft Clarity](https://clarity.microsoft.com/)
2. Sign in with your Microsoft account
3. Click **Add new project**
4. Enter project details:
   - Website URL: `https://cdmsuite.abacusai.app`
   - Project name: CDM Suite
5. Click **Setup** → **Install tracking code**
6. Copy your **Project ID** (format: alphanumeric string)

#### Add to Your App

Replace the placeholder in your `.env.local` file:

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=YOUR_ACTUAL_PROJECT_ID
```

#### What Clarity Tracks

- Heatmaps (click, scroll, area)
- Session recordings
- Rage clicks and dead clicks
- Excessive scrolling
- Quick backs
- JavaScript errors

#### Verify Setup

1. Visit your website after deployment
2. Go to Clarity dashboard
3. Wait 2-3 minutes for data to appear
4. Check **Recordings** tab for your session

---

### 3. PostHog

#### Create Your PostHog Account

1. Go to [PostHog Cloud](https://app.posthog.com/signup) or use your self-hosted instance
2. Create an account or sign in
3. Create a new project
4. Go to **Project Settings** → **Project API Key**
5. Copy your **Project API Key** (format: `phc_...`)
6. Your host URL is typically `https://app.posthog.com` (or your self-hosted URL)

#### Add to Your App

Replace the placeholders in your `.env.local` file:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_ACTUAL_KEY_HERE
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### What PostHog Tracks

- Custom events
- Feature flags
- A/B tests
- Funnels
- User paths
- Cohorts
- Session recordings
- Autocapture events

#### Verify Setup

1. Visit your website after deployment
2. Go to PostHog dashboard
3. Navigate to **Events** or **Live Events**
4. You should see `$pageview` events coming in

---

## 🚀 After Configuration

### Rebuild and Deploy

After updating your environment variables:

```bash
# If deploying to Vercel/production
vercel env pull
vercel --prod

# If testing locally
yarn build
yarn start
```

### Test All Analytics

1. **Visit your website** in incognito mode
2. **Navigate to multiple pages**
3. **Perform key actions** (form submissions, button clicks)
4. **Check each dashboard**:
   - GA4: Realtime report
   - Clarity: Recordings
   - PostHog: Live events

---

## 💡 Using Analytics in Your Code

### Track Custom Events

```typescript
import { trackEvent } from '@/lib/analytics';

// Track button click
trackEvent('button_clicked', {
  button_name: 'Sign Up',
  location: 'hero_section'
});

// Track form submission
trackEvent('form_submitted', {
  form_name: 'Contact Form',
  lead_source: 'Website'
});
```

### Identify Users

```typescript
import { identifyUser } from '@/lib/analytics';

// After user logs in
identifyUser('user_123', {
  email: 'user@example.com',
  plan: 'pro'
});
```

### Track Conversions

```typescript
import { trackConversion } from '@/lib/analytics';

// Track purchase
trackConversion('purchase_completed', 99.00, 'USD');
```

---

## 📊 What Each Platform Is Best For

| Feature | GA4 | Clarity | PostHog |
|---------|-----|---------|---------|
| Traffic Analysis | ✅ | ❌ | ✅ |
| Heatmaps | ❌ | ✅ | ✅ |
| Session Recordings | ❌ | ✅ | ✅ |
| Funnels | ✅ | ❌ | ✅ |
| Feature Flags | ❌ | ❌ | ✅ |
| A/B Testing | ✅ | ❌ | ✅ |
| User Cohorts | ✅ | ❌ | ✅ |
| E-commerce | ✅ | ❌ | ✅ |

---

## 🔒 Privacy & Compliance

All three platforms are configured to:
- Only load with valid IDs (placeholders are skipped)
- Run client-side to respect user consent
- Work with your existing cookie/consent management

**Recommended**: Add a cookie consent banner before going live for GDPR compliance.

---

## ❓ Troubleshooting

### Analytics Not Showing Data

1. **Check environment variables** are set correctly
2. **Verify IDs** don't contain placeholder values
3. **Clear browser cache** and test in incognito
4. **Check browser console** for errors
5. **Disable ad blockers** during testing

### PostHog Not Loading

- Verify `NEXT_PUBLIC_POSTHOG_KEY` starts with `phc_`
- Check `NEXT_PUBLIC_POSTHOG_HOST` is correct
- Consider setting up a reverse proxy if blocked

### Clarity Recordings Not Appearing

- Wait 2-3 minutes for processing
- Ensure you're testing from a different IP than setup
- Check Clarity dashboard for any errors

---

## 📞 Support

- **GA4**: [Google Analytics Help](https://support.google.com/analytics)
- **Clarity**: [Microsoft Clarity Docs](https://docs.microsoft.com/en-us/clarity/)
- **PostHog**: [PostHog Docs](https://posthog.com/docs)

---

## ✅ Quick Checklist

Before going live, ensure:

- [ ] All three analytics IDs are configured
- [ ] Environment variables are set in production
- [ ] App has been rebuilt after adding IDs
- [ ] Each dashboard shows live data
- [ ] Custom events are tracking correctly
- [ ] Cookie consent is implemented (if required)

---

**Need help?** Check the dashboards listed above or reach out for support!
