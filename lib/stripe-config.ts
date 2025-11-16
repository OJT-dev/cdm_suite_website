// Edge-safe Stripe configuration helpers

export function getStripePublishableKeyEdge(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!key || key === 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX') {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured');
  }

  return key;
}