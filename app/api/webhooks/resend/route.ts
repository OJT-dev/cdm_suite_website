

/**
 * Resend webhook endpoint for tracking email events
 * Configure this in Resend dashboard: https://resend.com/settings/webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackEmailOpen, trackEmailClick, trackEmailReply } from '@/lib/sequence-executor';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    const { type, data } = payload;
    
    console.log('📧 Resend webhook received:', type);

    switch (type) {
      case 'email.opened':
        await trackEmailOpen(data.email_id);
        break;
        
      case 'email.clicked':
        await trackEmailClick(data.email_id);
        break;
        
      case 'email.replied':
        await trackEmailReply(data.email_id);
        break;
        
      default:
        console.log('Unhandled webhook type:', type);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing Resend webhook:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

