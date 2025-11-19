
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/proposals/[id]/send - Mark proposal as sent and generate email
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Generate email template (don't auto-update status - let user confirm first)
    const emailTemplate = generateEmailTemplate(proposal);

    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    // For now, we'll return the email template

    return NextResponse.json({
      success: true,
      emailTemplate,
      message: 'Proposal marked as sent',
    });
  } catch (error) {
    console.error('Error sending proposal:', error);
    return NextResponse.json({ error: 'Failed to send proposal' }, { status: 500 });
  }
}

function generateEmailTemplate(proposal: any): { subject: string; body: string } {
  const proposalUrl = `${process.env.NEXTAUTH_URL}/proposal/${proposal.id}`;
  const pdfUrl = `${process.env.NEXTAUTH_URL}/api/proposals/${proposal.id}/pdf`;
  const paymentUrl = proposal.stripePaymentUrl || '';

  const subject = `Your Proposal from CDM Suite - ${proposal.proposalNumber}`;

  const body = `
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 30px;
      background: #ffffff;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .button-primary {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    }
    .payment-box {
      background: #f0fdf4;
      border: 2px solid #16a34a;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
      text-align: center;
    }
    .highlights {
      background: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .highlight-item {
      display: flex;
      align-items: center;
      margin: 10px 0;
    }
    .checkmark {
      color: #16a34a;
      margin-right: 10px;
      font-size: 20px;
    }
    .footer {
      background: #f8fafc;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 8px 8px;
      font-size: 13px;
      color: #64748b;
    }
    .amount {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 28px;">CDM Suite</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Digital Marketing Partner</p>
  </div>

  <div class="content">
    <h2 style="color: #1e293b;">Hi ${proposal.clientName},</h2>
    
    <p>We're excited to present your customized proposal for <strong>${proposal.title}</strong>.</p>

    <p>At CDM Suite, we've crafted a comprehensive strategy designed specifically to help ${proposal.clientCompany || 'your business'} achieve its digital marketing goals. This proposal outlines everything we'll deliver to drive measurable results for your brand.</p>

    <div class="amount">
      Investment: $${proposal.total.toFixed(2)}
    </div>

    <div class="highlights">
      <h3 style="margin-top: 0; color: #1e293b;">What's Included:</h3>
      ${JSON.parse(proposal.items).slice(0, 3).map((item: any) => `
        <div class="highlight-item">
          <span class="checkmark">✓</span>
          <span><strong>${item.name}</strong></span>
        </div>
      `).join('')}
      ${JSON.parse(proposal.items).length > 3 ? `
        <div class="highlight-item">
          <span class="checkmark">✓</span>
          <span>...and ${JSON.parse(proposal.items).length - 3} more service${JSON.parse(proposal.items).length - 3 > 1 ? 's' : ''}</span>
        </div>
      ` : ''}
    </div>

    ${paymentUrl ? `
      <div class="payment-box">
        <h3 style="margin-top: 0; color: #15803d;">💳 Secure Payment Available</h3>
        <p style="margin: 10px 0;">Pay securely online with credit card or bank transfer:</p>
        <a href="${paymentUrl}" class="button button-primary">Pay Now - $${proposal.total.toFixed(2)}</a>
        <p style="font-size: 13px; color: #64748b; margin-top: 15px;">
          Secure payment powered by Stripe. Your payment information is encrypted and secure.
        </p>
      </div>
    ` : ''}

    <p style="text-align: center;">
      <a href="${proposalUrl}" class="button">View Full Proposal</a>
    </p>

    <p>This proposal is valid until <strong>${proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'you accept it'}</strong>. We're here to answer any questions and can schedule a call at your convenience to discuss the details.</p>

    <p><strong>Ready to get started?</strong> ${paymentUrl ? 'Click the payment link above to secure your spot, or ' : ''}review the full proposal and let us know when you\'re ready to proceed. Once we get started, you\'ll see results in no time.</p>

    <p>Looking forward to working together!</p>

    <p style="margin-top: 30px;">
      <strong>Best regards,</strong><br>
      The CDM Suite Team<br>
      <a href="tel:8622727623">(862) 272-7623</a><br>
      <a href="mailto:info@cdmsuite.com">info@cdmsuite.com</a>
    </p>

    <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
      <strong>P.S.</strong> Have questions or want to customize anything? Just reply to this email or give us a call. We're always happy to adjust the proposal to fit your exact needs.
    </p>
  </div>

  <div class="footer">
    <p style="margin: 0;"><strong>CDM Suite</strong> | Full Service Digital Marketing Agency</p>
    <p style="margin: 10px 0 0 0;">Data-driven strategies that deliver measurable results</p>
  </div>
</body>
</html>
  `.trim();

  return { subject, body };
}
