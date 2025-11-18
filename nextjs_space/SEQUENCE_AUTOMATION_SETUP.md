
# Sequence Automation Setup Guide

## ✅ What's Configured

### Email Service (Resend)
- ✅ Resend SDK installed
- ✅ API key configured in .env
- ✅ Email service updated to use Resend
- ✅ Sequence executor can send emails

### Sequence Execution Engine
- ✅ Automated sequence processing
- ✅ Email step execution
- ✅ SMS step execution (ready for integration)
- ✅ Task step execution
- ✅ Merge tag replacement
- ✅ Performance tracking

## 🔧 What Needs Configuration

### 1. SMS Service (Choose One)

We recommend **Telnyx** for best pricing and reliability.

#### Option A: Telnyx (Recommended)
```bash
# Get API key from: https://portal.telnyx.com/#/app/api-keys
TELNYX_API_KEY=your_api_key
TELNYX_FROM_NUMBER=+1234567890
```

#### Option B: Plivo
```bash
# Get credentials from: https://console.plivo.com/dashboard/
PLIVO_AUTH_ID=your_auth_id
PLIVO_AUTH_TOKEN=your_auth_token
PLIVO_FROM_NUMBER=+1234567890
```

#### Option C: Vonage (Nexmo)
```bash
# Get API key from: https://dashboard.nexmo.com/
VONAGE_API_KEY=your_api_key
VONAGE_API_SECRET=your_api_secret
VONAGE_FROM_NUMBER=+1234567890
```

### 2. Cron Job Setup

The sequence processor needs to run regularly (every 5-15 minutes).

#### Option A: Vercel Cron (Easiest)
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/process-sequences",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

Then deploy with Vercel.

#### Option B: External Cron Service
Use a service like:
- **Cron-job.org** (free)
- **EasyCron** (free tier)
- **AWS EventBridge**

Configure to call:
```
GET https://cdmsuite.abacusai.app/api/cron/process-sequences
Headers:
  Authorization: Bearer YOUR_CRON_SECRET
```

Set `CRON_SECRET` in your .env file:
```bash
CRON_SECRET=generate-a-random-secret-key
```

### 3. Resend Domain Configuration

To send emails from your own domain (e.g., noreply@cdmsuite.com):

1. Go to Resend dashboard: https://resend.com/domains
2. Add your domain: cdmsuite.com
3. Add DNS records provided by Resend
4. Update .env:
```bash
EMAIL_FROM='CDM Suite <noreply@cdmsuite.com>'
```

### 4. Webhook Configuration (For Email Tracking)

Configure Resend webhooks for tracking:

1. Go to: https://resend.com/webhooks
2. Add webhook URL: `https://cdmsuite.abacusai.app/api/webhooks/resend`
3. Select events:
   - email.opened
   - email.clicked
   - email.bounced
   - email.delivered

## 📊 How Sequences Work

### Step 1: Create a Sequence
- Go to Dashboard → Sequences
- Create a new sequence with steps (email, SMS, tasks)
- Set delays between steps
- Use merge tags for personalization

### Step 2: Assign to Leads
- Go to Lead CRM
- Select a lead
- Click "Add to Sequence"
- Choose which sequence to assign

### Step 3: Automatic Execution
- The cron job runs every 10 minutes
- Checks for active sequence assignments
- Executes steps that are ready (based on delays)
- Tracks opens, clicks, and replies
- Creates tasks automatically

### Step 4: Monitor Performance
- View sequence performance in Sequence Manager
- Track email opens, clicks, replies
- See conversion rates
- View detailed activity logs

## 🧪 Testing

### Test Email Sending
```bash
# Send a test email
curl -X POST https://cdmsuite.abacusai.app/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your@email.com", "subject": "Test", "content": "Test email"}'
```

### Manually Trigger Sequence Processing
```bash
# Run sequence processor manually
curl -X POST https://cdmsuite.abacusai.app/api/cron/process-sequences \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 🔍 Monitoring

Check logs in:
- Vercel Dashboard → Functions → Logs
- Resend Dashboard → Logs
- Your database → sequence_activity table

## 🚀 Next Steps

1. **Configure SMS service** - Add Telnyx credentials
2. **Set up cron job** - Use Vercel Cron or external service
3. **Configure Resend domain** - Use your own email domain
4. **Set up webhooks** - Track email events
5. **Test sequences** - Create and test a simple sequence

## 📝 SMS Integration Example (Telnyx)

Once you have Telnyx configured, the system will automatically send SMS. Here's what the integration looks like:

```typescript
// lib/sms.ts (You can create this after getting SMS credentials)
import axios from 'axios';

export async function sendSms(to: string, message: string): Promise<boolean> {
  try {
    const response = await axios.post(
      'https://api.telnyx.com/v2/messages',
      {
        from: process.env.TELNYX_FROM_NUMBER,
        to: to,
        text: message,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.status === 200;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}
```

Then update `executeSmsStep` in `lib/sequence-executor.ts` to use this function.

---

Need help? Check the documentation or contact support.
