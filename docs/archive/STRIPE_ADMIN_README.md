
# Stripe & Admin Dashboard Guide

## 🎯 Overview
Your CDM Suite website now has a complete Stripe integration and admin dashboard for managing services and pricing.

## 🔑 Key Features

### 1. **Dynamic Pricing System**
- All service prices are stored in the database
- Services can be easily updated without code changes
- Changes reflect immediately on the pricing page

### 2. **Admin Dashboard**
**Access:** `/admin`

Features:
- View all services
- Edit service details:
  - Name
  - Description
  - Price (in USD)
  - Features list
  - Mark as "Popular"
  - Activate/Deactivate services
- Changes are saved to database in real-time

### 3. **Stripe Integration**

#### Purchase Flow:
1. Customer clicks "Get Started" on pricing page
2. Redirected to Stripe Checkout (secure hosted page)
3. After payment, redirected to success page
4. Order saved to database automatically

#### Order Tracking:
- All orders are saved in the `orders` table
- Track customer email, name, package, price, and status
- Webhook handles payment confirmation automatically

### 4. **Service Management**

#### Current Services:
1. **Responsive Web Design** - $2,999
2. **Digital Advertising Campaign** - $1,999
3. **Mobile App Development** - $9,999
4. **AI Implementation Services** - $4,999
5. **Full Service Package** - $14,999 (Popular)

## 📝 How to Update Pricing

### Method 1: Using Admin Dashboard (Recommended)
1. Go to `/admin`
2. Click "Edit" on any service
3. Update the price field
4. Update features (one per line)
5. Click "Save Changes"
6. Changes are live immediately!

### Method 2: Using Database Directly
```sql
UPDATE services 
SET price = 3999 
WHERE slug = 'web-design';
```

## 🔄 Adding New Services

You can add new services directly to the database:

```sql
INSERT INTO services (slug, name, description, price, features, popular, active, "sortOrder")
VALUES (
  'custom-service',
  'Custom Service Name',
  'Brief description',
  5999,
  ARRAY['Feature 1', 'Feature 2', 'Feature 3'],
  false,
  true,
  6
);
```

## 🎨 Customization

### Checkout Button Component
Use the `<CheckoutButton>` component anywhere on your site:

```tsx
import { CheckoutButton } from '@/components/checkout-button';

<CheckoutButton 
  serviceId="service-id-from-database"
  serviceName="Web Design"
  fullWidth
/>
```

### API Endpoints

#### Get All Services
```bash
GET /api/services
```

#### Get Service by Slug
```bash
GET /api/services/by-slug/web-design
```

#### Update Service
```bash
PATCH /api/services/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 3999,
  "features": ["Feature 1", "Feature 2"]
}
```

#### Create Checkout Session
```bash
POST /api/create-checkout-session
Content-Type: application/json

{
  "serviceId": "service-id"
}
```

## 🔐 Stripe Configuration

Your Stripe keys are already configured in `.env`:
- `STRIPE_SECRET_KEY` - For server-side operations
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For client-side Stripe.js

### Webhook Setup (Production)
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events: `checkout.session.completed`
4. Copy webhook secret
5. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

## 📊 Viewing Orders

### Database Query
```sql
SELECT * FROM orders ORDER BY "createdAt" DESC;
```

### Order Statuses
- `pending` - Payment initiated but not confirmed
- `completed` - Payment successful
- `failed` - Payment failed

## 🚀 Testing Stripe (Development)

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date, any CVC

## 🛠️ Troubleshooting

### Orders not saving?
1. Check webhook is configured correctly
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Check server logs for errors

### Prices not updating?
1. Ensure database connection is working
2. Check admin dashboard for any errors in console
3. Verify Prisma Client is generated: `yarn prisma generate`

### Checkout not working?
1. Verify Stripe keys are correct
2. Check browser console for errors
3. Ensure service is `active: true` in database

## 💡 Tips

1. **Test in Development First**: Use Stripe test mode before going live
2. **Monitor Orders**: Regularly check the orders table for successful purchases
3. **Keep Prices Updated**: Use the admin dashboard to adjust pricing based on market demand
4. **Service Features**: Make features specific and benefit-focused for better conversions
5. **Popular Badge**: Mark your best-selling service as popular to guide customers

## 📱 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Questions?** Contact support or refer to the inline code comments.
