
import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance } from '@/lib/stripe';
import { redirect } from 'next/navigation';

// Tripwire offer data - matches getTripwireOffer in send-tool-results/route.ts
const TRIPWIRE_OFFERS: { [key: string]: any } = {
  'SEO Starter Package': {
    originalPrice: 497,
    discountPrice: 197,
    savings: 300,
  },
  'Website Transformation Package': {
    originalPrice: 997,
    discountPrice: 297,
    savings: 700,
  },
  'Growth Accelerator Package': {
    originalPrice: 1497,
    discountPrice: 497,
    savings: 1000,
  },
  'Full-Service Marketing Package': {
    originalPrice: 1997,
    discountPrice: 997,
    savings: 1000,
  },
  'Email Domination Package': {
    originalPrice: 997,
    discountPrice: 397,
    savings: 600,
  },
  'CRO Intensive Package': {
    originalPrice: 1997,
    discountPrice: 697,
    savings: 1300,
  },
  'Social Media Domination': {
    originalPrice: 1497,
    discountPrice: 497,
    savings: 1000,
  },
  'Landing Page Makeover': {
    originalPrice: 1497,
    discountPrice: 597,
    savings: 900,
  },
  'Lead Generation System': {
    originalPrice: 1297,
    discountPrice: 497,
    savings: 800,
  },
  'Funnel Optimization Package': {
    originalPrice: 1997,
    discountPrice: 797,
    savings: 1200,
  },
  'Content Domination Package': {
    originalPrice: 1297,
    discountPrice: 497,
    savings: 800,
  },
  'Custom Marketing Strategy': {
    originalPrice: 997,
    discountPrice: 297,
    savings: 700,
  },
};

/**
 * GET handler - For email links
 * Redirects to Stripe checkout for the specified tripwire offer
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const offerName = searchParams.get('offer');
    const customerEmail = searchParams.get('email');

    if (!offerName) {
      return NextResponse.redirect(new URL('/tools?error=missing-offer', req.url));
    }

    // Look up offer details
    const offer = TRIPWIRE_OFFERS[offerName];
    if (!offer) {
      console.error(`Unknown tripwire offer: ${offerName}`);
      return NextResponse.redirect(new URL('/tools?error=invalid-offer', req.url));
    }

    const origin = req.headers.get('origin') || req.nextUrl.origin;
    const stripe = getStripeInstance();

    // Create checkout session
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `🎁 Limited Time Offer: ${offerName}`,
              description: `Special promotional package - Save $${offer.savings}!`,
            },
            unit_amount: Math.round(offer.discountPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment for tripwire offers
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&offer=${encodeURIComponent(offerName)}`,
      cancel_url: `${origin}/tools?canceled=true`,
      metadata: {
        offerType: 'tripwire',
        offerName: offerName,
        serviceName: offerName,
        tierName: offerName,
        originalPrice: offer.originalPrice.toString(),
        discountAmount: offer.savings.toString(),
        serviceType: 'one-time',
      },
    };

    // Pre-fill customer email if provided
    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Redirect to Stripe checkout
    return NextResponse.redirect(session.url!);
  } catch (error: any) {
    console.error('Stripe tripwire checkout error:', error);
    return NextResponse.redirect(new URL('/tools?error=checkout-failed', req.url));
  }
}

/**
 * POST handler - For programmatic API calls
 * Returns session info as JSON
 */
export async function POST(req: NextRequest) {
  try {
    const { offerName, amount, originalPrice, customerEmail, customerName } = await req.json();

    if (!offerName || !amount) {
      return NextResponse.json(
        { error: 'Offer name and amount are required' },
        { status: 400 }
      );
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const stripe = getStripeInstance();

    // Create checkout session for tripwire offer
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `🎁 Limited Time Offer: ${offerName}`,
              description: `Special promotional package - Save $${originalPrice - amount}!`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment for tripwire offers
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&offer=${encodeURIComponent(offerName)}`,
      cancel_url: `${origin}/tools?canceled=true`,
      metadata: {
        offerType: 'tripwire',
        offerName: offerName,
        serviceName: offerName,
        tierName: offerName,
        originalPrice: originalPrice.toString(),
        discountAmount: (originalPrice - amount).toString(),
        serviceType: 'one-time',
      },
    };

    // Pre-fill customer email if provided
    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error: any) {
    console.error('Stripe tripwire session creation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
