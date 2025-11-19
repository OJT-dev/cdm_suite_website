
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export const runtime = 'nodejs';

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.warn('STRIPE_SECRET_KEY not configured. Checkout sessions cannot be created.');
    return null;
  }

  return new Stripe(apiKey, {
    apiVersion: '2025-10-29.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, company, websiteUrl, phone, serviceType, userId } = body;

    if (!email || !name || !websiteUrl) {
      return NextResponse.json(
        { error: 'Email, name, and website URL are required' },
        { status: 400 }
      );
    }

    // Determine price based on service type
    const prices = {
      'done-for-you': {
        priceId: process.env.STRIPE_PRICE_WEBSITE_FIX_DFY || 'price_1234', // Replace with actual price ID
        amount: 10000, // $100 in cents
        name: 'Website Performance Fix - Done-For-You'
      },
      'self-service': {
        priceId: process.env.STRIPE_PRICE_WEBSITE_FIX_SELF || 'price_5678', // Replace with actual price ID
        amount: 5000, // $50 in cents
        name: 'Website Performance Fix - Self-Service'
      }
    };

    const selectedPrice = prices[serviceType as keyof typeof prices] || prices['done-for-you'];

    // Create or update lead in CRM
    await prisma.lead.create({
      data: {
        email,
        name,
        phone: phone || null,
        source: 'Website Fix Checkout',
        interest: `${selectedPrice.name} - ${websiteUrl}`,
        status: 'NEW',
        tags: JSON.stringify(['website-fix', 'tripwire', serviceType]),
        notes: JSON.stringify({ company, websiteUrl, serviceType }),
      },
    });

    // Create Stripe checkout session
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: selectedPrice.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/services/website-fix/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/services/website-fix?canceled=true`,
      metadata: {
        userId: userId || '',
        email,
        name,
        company: company || '',
        websiteUrl,
        phone: phone || '',
        serviceType,
      },
      subscription_data: {
        metadata: {
          userId: userId || '',
          serviceType,
          websiteUrl,
        },
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
