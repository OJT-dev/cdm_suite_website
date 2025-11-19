
import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { serviceId, tierId, tierName, amount } = await req.json();

    // Fetch service from database
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.active) {
      return NextResponse.json(
        { error: 'Invalid service selected' },
        { status: 400 }
      );
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const stripe = getStripeInstance();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 },
      );
    }

    // Determine if this is a recurring or one-time service
    const isRecurring = service.slug.includes('maintenance') ||
      service.slug.includes('seo') ||
      service.slug.includes('social-media') ||
      service.slug.includes('ad-management') ||
      service.slug.includes('bundle');

    // Use tier-specific pricing if provided, otherwise use service price
    const finalPrice = amount || service.price;
    const productName = tierName
      ? `${service.name} - ${tierName}`
      : service.name;

    let sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: service.description,
            },
            unit_amount: Math.round(finalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/services?canceled=true`,
      metadata: {
        serviceId: service.id,
        serviceName: service.name,
        tierId: tierId || '',
        tierName: tierName || '',
        serviceType: isRecurring ? 'subscription' : 'one-time',
      },
      // customer_email will be collected during checkout
    };

    if (isRecurring) {
      // Subscription payment
      sessionConfig.line_items[0].price_data.recurring = {
        interval: 'month',
      };
      sessionConfig.mode = 'subscription';
    } else {
      // One-time payment
      sessionConfig.mode = 'payment';
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
