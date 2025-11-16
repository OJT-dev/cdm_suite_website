
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateProposalNumber } from '@/lib/proposal-types';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

// GET /api/proposals - List proposals
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('leadId');
  const status = searchParams.get('status');

  try {
    const where: any = {};
    
    if (leadId) {
      where.leadId = leadId;
    }
    
    if (status) {
      where.status = status;
    }

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        lead: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse items JSON
    const proposalsWithParsedItems = proposals.map((proposal: any) => ({
      ...proposal,
      items: JSON.parse(proposal.items),
    }));

    return NextResponse.json({ proposals: proposalsWithParsedItems });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

// POST /api/proposals - Create proposal
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      leadId,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      title,
      description,
      items,
      tax,
      discount,
      terms,
      notes,
      dueDate,
      validUntil,
    } = body;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
    const taxAmount = ((subtotal - discount) * tax) / 100;
    const total = subtotal - discount + taxAmount;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate proposal number
    const proposalNumber = generateProposalNumber();

    // Create Stripe product and payment link
    let stripePaymentUrl = null;
    let stripePaymentLinkId = null;
    
    try {
      // Create Stripe product
      const product = await stripe.products.create({
        name: title,
        description: description || undefined,
        metadata: {
          proposalNumber,
          clientEmail,
        },
      });

      // Create price (in cents)
      const priceAmount = Math.round(total * 100);
      
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceAmount,
        currency: 'usd',
      });

      // Create payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.NEXTAUTH_URL}/proposal-success?proposal=${proposalNumber}`,
          },
        },
        metadata: {
          proposalNumber,
        },
        invoice_creation: {
          enabled: true,
          invoice_data: {
            description: `Payment for ${title}`,
            custom_fields: [
              {
                name: 'Proposal Number',
                value: proposalNumber,
              },
            ],
            metadata: {
              proposalNumber,
            },
          },
        },
      });

      stripePaymentUrl = paymentLink.url;
      stripePaymentLinkId = paymentLink.id;
    } catch (stripeError: any) {
      console.error('Error creating Stripe payment link:', stripeError);
      // Continue with proposal creation even if Stripe fails
    }

    // Create proposal
    const proposal = await prisma.proposal.create({
      data: {
        proposalNumber,
        leadId: leadId || null,
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        title,
        description,
        items: JSON.stringify(items),
        subtotal,
        tax: taxAmount,
        discount,
        total,
        terms,
        notes,
        dueDate: dueDate ? new Date(dueDate) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        stripePaymentUrl,
        stripePaymentLinkId,
        createdById: user.id,
      },
      include: {
        lead: true,
      },
    });

    return NextResponse.json({
      proposal: {
        ...proposal,
        items: JSON.parse(proposal.items),
      },
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}
