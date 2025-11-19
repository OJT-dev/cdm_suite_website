
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';


export const runtime = 'nodejs';

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.warn(
      'STRIPE_SECRET_KEY not configured. Stripe payment links cannot be created or updated.'
    );
    return null;
  }

  return new Stripe(apiKey, {
    apiVersion: '2025-10-29.clover',
  });
}

// GET /api/proposals/[id] - Get single proposal
export async function GET(
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
      include: {
        lead: true,
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({
      proposal: {
        ...proposal,
        items: JSON.parse(proposal.items),
      },
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 });
  }
}

// PATCH /api/proposals/[id] - Update proposal
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items, tax, discount, title, description, ...otherFields } = body;

    // Get existing proposal to check if total changed
    const existingProposal = await prisma.proposal.findUnique({
      where: { id: params.id },
    });

    if (!existingProposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    let updateData: any = { ...otherFields };
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    // Recalculate totals if items changed
    let newTotal = existingProposal.total;
    if (items) {
      const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
      const taxAmount = ((subtotal - (discount || 0)) * (tax || 0)) / 100;
      newTotal = subtotal - (discount || 0) + taxAmount;

      updateData = {
        ...updateData,
        items: JSON.stringify(items),
        subtotal,
        tax: taxAmount,
        discount: discount || 0,
        total: newTotal,
      };
    }

    // If total changed, regenerate Stripe payment link
    if (newTotal !== existingProposal.total) {
      try {
        const stripe = getStripeClient();

        if (!stripe) {
          console.warn(
            'Stripe client not available; skipping payment link regeneration for proposal',
            existingProposal.proposalNumber
          );
        } else {
          // Deactivate old payment link if it exists
          if (existingProposal.stripePaymentLinkId) {
            await stripe.paymentLinks.update(existingProposal.stripePaymentLinkId, {
              active: false,
            });
          }

          // Create new Stripe product
          const product = await stripe.products.create({
            name: title || existingProposal.title,
            description:
              description !== undefined
                ? description
                : existingProposal.description || undefined,
            metadata: {
              proposalNumber: existingProposal.proposalNumber,
              clientEmail: existingProposal.clientEmail,
            },
          });

          // Create new price (in cents)
          const priceAmount = Math.round(newTotal * 100);

          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: priceAmount,
            currency: 'usd',
          });

          // Create new payment link
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
                url: `${process.env.NEXTAUTH_URL}/proposal-success?proposal=${existingProposal.proposalNumber}`,
              },
            },
            metadata: {
              proposalNumber: existingProposal.proposalNumber,
            },
            invoice_creation: {
              enabled: true,
              invoice_data: {
                description: `Payment for ${title || existingProposal.title}`,
                custom_fields: [
                  {
                    name: 'Proposal Number',
                    value: existingProposal.proposalNumber,
                  },
                ],
                metadata: {
                  proposalNumber: existingProposal.proposalNumber,
                },
              },
            },
          });

          updateData.stripePaymentUrl = paymentLink.url;
          updateData.stripePaymentLinkId = paymentLink.id;
        }
      } catch (stripeError: any) {
        console.error('Error updating Stripe payment link:', stripeError);
        // Continue with proposal update even if Stripe fails
      }
    }

    const proposal = await prisma.proposal.update({
      where: { id: params.id },
      data: updateData,
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
    console.error('Error updating proposal:', error);
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }
}

// DELETE /api/proposals/[id] - Delete proposal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only the master user (fray@cdmsuite.com) can delete proposals
  if (session.user.email !== 'fray@cdmsuite.com') {
    return NextResponse.json({ error: 'Only the master user can delete proposals' }, { status: 403 });
  }

  try {
    await prisma.proposal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 });
  }
}
