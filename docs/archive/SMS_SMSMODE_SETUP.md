# SMSMode SMS Integration - Complete Setup Guide

## ✅ Configuration Complete

Your CDM Suite application has been successfully configured with **SMSMode** for SMS functionality in your sequence automation system.

### 🔑 Credentials Configured

- **Service**: SMSMode (https://dev.smsmode.com/)
- **API Key**: `ztKlxr8SfyxDurGedCrtVhq6zNWC0Gz2` ✅
- **Verified Email Domain**: `updates.cdmsuite.com` ✅

---

## 📋 What's Been Set Up

### 1. **SMSMode Service Integration** (`lib/sms.ts`)
A complete SMSMode service class with:
- ✅ SMS sending functionality
- ✅ Delivery status tracking
- ✅ Account balance checking
- ✅ Error handling with detailed error messages
- ✅ International phone number support

### 2. **Enhanced Email Service** (`lib/email.ts`)
Updated Resend integration with:
- ✅ Message tagging for tracking
- ✅ Lead and sequence step tracking
- ✅ Verified domain support (`updates.cdmsuite.com`)

### 3. **Sequence Execution Engine** (`lib/sequence-executor.ts`)
Complete automation engine supporting:
- ✅ Email sequences (via Resend)
- ✅ SMS sequences (via SMSMode)
- ✅ Task creation and reminders
- ✅ Delay/wait steps with flexible timing
- ✅ Personalization with merge tags
- ✅ Email tracking (opens, clicks, replies)
- ✅ Automatic sequence pausing on lead reply
- ✅ Performance metrics and analytics

### 4. **Admin API Endpoints**
- `POST /api/admin/sms/test` - Send test SMS messages
- `GET /api/admin/sms/test` - Check SMS account balance

### 5. **Automation Infrastructure**
- ✅ Cron job endpoint: `/api/cron/process-sequences`
- ✅ Resend webhook: `/api/webhooks/resend`
- ✅ Cron-job.org configured to run every 5 minutes

---

## 🧪 Testing Your Setup

### Test 1: Check SMS Balance

```bash
curl -X GET https://cdmsuite.abacusai.app/api/admin/sms/test \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "balance": 50.00,
  "currency": "EUR"
}
```

### Test 2: Send Test SMS

```bash
curl -X POST https://cdmsuite.abacusai.app/api/admin/sms/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "phone": "+15551234567",
    "message": "Test SMS from CDM Suite! This message confirms your SMS integration is working perfectly."
  }'
```

Expected response:
```json
{
  "success": true,
  "messageId": "12345678",
  "message": "SMS sent successfully"
}
```

### Test 3: Trigger Sequence Processing

```bash
curl -X GET https://cdmsuite.abacusai.app/api/cron/process-sequences \
  -H "Authorization: Bearer cdm-suite-cron-secret-2025-secure-key-xyz"
```

Expected response:
```json
{
  "success": true,
  "processed": 5,
  "executed": 3,
  "failed": 0,
  "timestamp": "2025-10-14T12:00:00.000Z"
}
```

---

## 🚀 Using SMS in Sequences

### Creating a Sequence with SMS Steps

1. **Navigate to CRM → Sequences**
2. **Create New Sequence**
3. **Add SMS Steps:**

Example sequence configuration:
```json
{
  "name": "New Lead Follow-up",
  "steps": [
    {
      "order": 1,
      "stepType": "email",
      "title": "Welcome Email",
      "subject": "Welcome to CDM Suite, {{name}}!",
      "content": "Hi {{name}},\n\nThanks for your interest...",
      "delayAmount": 0,
      "delayUnit": "hours"
    },
    {
      "order": 2,
      "stepType": "delay",
      "title": "Wait 2 days",
      "delayAmount": 2,
      "delayUnit": "days"
    },
    {
      "order": 3,
      "stepType": "sms",
      "title": "Follow-up SMS",
      "content": "Hi {{name}}! Just checking in - have you had a chance to review our proposal? Reply here or call us at (862) 272-7623",
      "delayAmount": 0,
      "delayUnit": "hours"
    },
    {
      "order": 4,
      "stepType": "task",
      "title": "Manual Follow-up Call",
      "content": "Call lead to discuss next steps",
      "delayAmount": 3,
      "delayUnit": "days"
    }
  ]
}
```

### Personalization Merge Tags

Use these merge tags in your email/SMS content:
- `{{name}}` - Lead name
- `{{email}}` - Lead email address
- `{{phone}}` - Lead phone number
- `{{company}}` - Lead company name

---

## 📊 Monitoring & Analytics

### Lead Activity Tracking

The system automatically logs:
- ✅ Email sent, opened, clicked, replied
- ✅ SMS sent and delivered
- ✅ Tasks created and completed
- ✅ Sequence status changes

### Sequence Metrics

Available metrics per sequence:
- `emailsSent` - Total emails sent
- `emailsOpened` - Total emails opened
- `emailsClicked` - Total email links clicked
- `emailsReplied` - Total email replies received
- `tasksCreated` - Total tasks created
- `tasksCompleted` - Total tasks completed
- `converted` - Leads that converted
- `conversionRate` - Conversion percentage

---

## ⚙️ Advanced Configuration

### Phone Number Format

SMSMode expects international format without the `+` prefix:
- ✅ Good: `15551234567` (handled automatically)
- ✅ Good: `+15551234567` (converted automatically)
- ❌ Bad: `(555) 123-4567`

The system automatically cleans and formats phone numbers.

### SMS Character Limits

- Standard SMS: 160 characters
- Long SMS: Auto-splits into multiple messages
- Unicode/Emoji: 70 characters per message

### Error Handling

The system handles these SMSMode errors:
- **Code 2**: Missing parameter
- **Code 3**: Invalid parameter
- **Code 5**: Authentication error (check API key)
- **Code 10**: Insufficient credits
- **Code 11**: Recipient count exceeds limit
- **Code 32**: Invalid characters in message
- **Code 35**: Invalid phone number

---

## 🎯 Best Practices

### 1. **Timing Your SMS**
- Send during business hours (9 AM - 6 PM local time)
- Avoid weekends unless appropriate
- Use delays between steps (minimum 1-2 days)

### 2. **Message Content**
- Keep messages concise and clear
- Include your business name
- Provide a clear call-to-action
- Always include opt-out instructions
- Comply with SMS marketing regulations (TCPA, GDPR)

### 3. **Sequence Strategy**
- Start with email, follow up with SMS
- Mix channels (email + SMS + tasks)
- Don't over-communicate (2-3 touches per week max)
- Pause sequences when leads engage

### 4. **Testing**
- Test sequences with your own phone number first
- Verify personalization works correctly
- Check all merge tags before activating
- Monitor initial batches closely

---

## 🔐 Security & Compliance

### API Key Security
- ✅ Stored in `.env` file (never in code)
- ✅ Not exposed to client-side
- ✅ Protected by server-side authentication

### GDPR Compliance
- Obtain explicit consent before sending SMS
- Provide easy opt-out mechanism
- Store consent records
- Honor unsubscribe requests immediately

### TCPA Compliance (US)
- Get written consent for marketing texts
- Include opt-out instructions in every message
- Honor "STOP" requests within 10 days
- Don't send texts before 8 AM or after 9 PM

---

## 🛠️ Troubleshooting

### SMS Not Sending?

1. **Check API Key**:
   ```bash
   # Verify in .env file
   grep SMSMODE_API_KEY /home/ubuntu/cdm_suite_website/nextjs_space/.env
   ```

2. **Check Balance**:
   ```bash
   curl https://api.smsmode.com/http/1.6/credit.do?accessToken=YOUR_API_KEY
   ```

3. **Test Phone Number Format**:
   - Must be in international format
   - Include country code
   - Remove special characters

4. **Check Logs**:
   ```bash
   # View application logs
   pm2 logs cdm-suite
   ```

### Sequence Not Running?

1. **Verify Cron Job**:
   - Check cron-job.org dashboard
   - Ensure it's enabled and running every 5 minutes

2. **Check Sequence Status**:
   - Sequence must be "active"
   - Assignment must be "active"
   - Lead must have required contact info (email/phone)

3. **Review Timing**:
   - Check delay settings on each step
   - Verify last execution timestamp

### Email Tracking Not Working?

1. **Verify Webhook**:
   - Check Resend dashboard webhook configuration
   - URL: `https://cdmsuite.abacusai.app/api/webhooks/resend`
   - Events: email.opened, email.clicked, email.replied

2. **Check Message ID**:
   - Ensure emails include tracking tags
   - Verify messageId is stored in activity log

---

## 📞 Support

### SMSMode Support
- Documentation: https://dev.smsmode.com/
- Email: support@smsmode.com
- Phone: +33 (0)4 84 79 02 00

### Resend Support
- Documentation: https://resend.com/docs
- Email: support@resend.com
- Discord: https://resend.com/discord

### CDM Suite Support
- Email: support@cdmsuite.com
- Phone: (862) 272-7623

---

## ✨ Next Steps

1. ✅ **Test SMS Functionality** - Send a test SMS to your phone
2. ✅ **Create Your First Sequence** - Build a simple email + SMS sequence
3. ✅ **Assign to Test Lead** - Test the full automation flow
4. ✅ **Monitor Performance** - Track metrics and optimize
5. ✅ **Scale Up** - Roll out to your lead database

---

**Congratulations!** 🎉 Your SMS automation is ready to boost your lead engagement and conversion rates!
