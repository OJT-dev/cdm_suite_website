
import { NextResponse } from 'next/server';
import { getStripePublishableKeyEdge } from '@/lib/stripe-config';
export const runtime = 'edge';


export const runtime = 'nodejs';

export async function GET() {
  const publishableKey = getStripePublishableKeyEdge();
  return NextResponse.json({ publishableKey });
}
