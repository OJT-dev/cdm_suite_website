
import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/session';

export const runtime = 'nodejs';

// Premium SaaS pricing - professional DIY tools positioned between entry-level and full professional services
const TIER_PRICING = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID || null,
    amount: 199, // Professional DIY subscription
    name: 'Starter Plan - Professional Website Builder',
    features: '5 website credits/month, AI website builder with advanced features, Professional templates, Email support within 24hrs, Export code, SEO optimization'
  },
  growth: {
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || null,
    amount: 499,
    name: 'Growth Plan - Professional Website Builder',
    features: '15 website credits/month, Priority AI processing, Premium templates, Advanced analytics, Priority support (12hr response), Custom domains, Team collaboration'
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
    amount: 999,
    name: 'Pro Plan - Professional Website Builder',
    features: '40 website credits/month, All premium features, Advanced customization & white-label, Full analytics suite, Priority support + live chat (4hr response), API access, Unlimited team users, Monthly strategy consultation'
  }
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tierId } = await req.json();

    if (!tierId || !TIER_PRICING[tierId as keyof typeof TIER_PRICING]) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      );
    }

    const tierConfig = TIER_PRICING[tierId as keyof typeof TIER_PRICING];
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const stripe = getStripeInstance();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 },
      );
    }

    // Create checkout session
    const sessionConfig: any = {
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      client_reference_id: user.id,
      success_url: `${origin}/dashboard/billing?success=true&tier=${tierId}`,
      cancel_url: `${origin}/dashboard/billing?canceled=true`,
      metadata: {
        userId: user.id,
        tier: tierId,
        userEmail: user.email,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: tierId,
        },
      },
    };

    // If we have a pre-configured Price ID, use it
    if (tierConfig.priceId) {
      sessionConfig.line_items = [
        {
          price: tierConfig.priceId,
          quantity: 1,
        },
      ];
    } else {
      // Create price on the fly
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tierConfig.name,
              description: tierConfig.features,
            },
            unit_amount: Math.round(tierConfig.amount * 100), // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error: any) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
