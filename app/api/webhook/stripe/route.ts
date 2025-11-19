
import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';


export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // In production, you would verify the webhook signature
    event = JSON.parse(body);
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Save order to database
      try {
        await prisma.order.create({
          data: {
            stripeSessionId: session.id,
            customerEmail: session.customer_details?.email || '',
            customerName: session.customer_details?.name || '',
            packageName: session.metadata?.packageName || '',
            packagePrice: (session.amount_total || 0) / 100,
            status: 'completed',
          },
        });
      } catch (error) {
        console.error('Error saving order:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
