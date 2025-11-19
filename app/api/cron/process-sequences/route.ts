
/**
 * Cron job endpoint to process sequence queue
 * Should be called by a scheduler (Vercel Cron, external cron service, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { processSequenceQueue } from '@/lib/sequence-executor';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max execution

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Processing sequence queue...');
    const result = await processSequenceQueue();
    
    console.log('✅ Sequence processing complete:', result);
    
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error in sequence cron job:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}

