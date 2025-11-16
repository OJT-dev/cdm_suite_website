
import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const stripe = getStripeInstance();
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Update or create order in database
      await prisma.order.upsert({
        where: { stripeSessionId: session.id },
        update: {
          status: 'completed',
          customerEmail: session.customer_details?.email || '',
          customerName: session.customer_details?.name || null,
        },
        create: {
          stripeSessionId: session.id,
          customerEmail: session.customer_details?.email || '',
          customerName: session.customer_details?.name || null,
          packageName: session.metadata?.packageName || 'Unknown',
          packagePrice: (session.amount_total || 0) / 100,
          status: 'completed',
        },
      });

      // Track Reddit conversion with actual purchase details
      const redditPixelId = process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID;
      const redditToken = process.env.REDDIT_CONVERSION_TOKEN;
      
      if (redditPixelId && redditToken) {
        try {
          const purchaseValue = (session.amount_total || 0) / 100;
          const currency = (session.currency || 'usd').toUpperCase();
          const packageName = session.metadata?.packageName || 'Unknown';
          
          // Generate conversion ID for deduplication
          const conversionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-stripe-${session.id}`;
          
          await fetch(
            `https://ads-api.reddit.com/api/v3/pixels/${redditPixelId}/conversion_events`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${redditToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                data: {
                  events: [{
                    event_at: Date.now(),
                    action_source: 'web',
                    type: {
                      tracking_type: 'Purchase',
                    },
                    user: {
                      email: session.customer_details?.email,
                    },
                    value_decimal: purchaseValue,
                    currency: currency,
                    metadata: {
                      conversion_id: conversionId,
                      value: purchaseValue,
                      currency: currency,
                      item_count: 1,
                      products: [{
                        id: session.id,
                        name: packageName,
                        category: 'Digital Service',
                      }],
                    },
                  }],
                },
              }),
            }
          );
          
          console.log('✅ Reddit conversion tracked for purchase:', session.id);
        } catch (error) {
          console.error('Error tracking Reddit conversion:', error);
          // Don't fail the webhook if tracking fails
        }
      }

      console.log('✅ Order completed:', session.id);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
