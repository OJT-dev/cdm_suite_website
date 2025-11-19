
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

/**
 * Stripe Web API helper
 */
async function stripeRequest(path: string, body: Record<string, any>) {
  const formBody = new URLSearchParams();
  for (const key in body) {
    const value = body[key];
    if (value !== undefined && value !== null) {
      if (typeof value === "object") {
        for (const innerKey in value) {
          formBody.append(`${key}[${innerKey}]`, value[innerKey]);
        }
      } else {
        formBody.append(key, value.toString());
      }
    }
  }

  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody.toString(),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Stripe API error");
  }

  return res.json();
}


/**
 * POST /api/proposals/[id]/payment-link
 * Create Stripe payment link via Web API (Cloudflare Edge Compatible)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Return existing link if it already exists
    if (proposal.stripePaymentLinkId && proposal.stripePaymentUrl) {
      return NextResponse.json({
        paymentUrl: proposal.stripePaymentUrl,
        paymentLinkId: proposal.stripePaymentLinkId,
      });
    }

    // Create product
    const product = await stripeRequest("products", {
      name: proposal.title,
      description: proposal.description || undefined,
      "metadata[proposalId]": proposal.id,
      "metadata[proposalNumber]": proposal.proposalNumber,
      "metadata[clientEmail]": proposal.clientEmail,
    });

    // Price in cents
    const priceAmount = Math.round(proposal.total * 100);

    const price = await stripeRequest("prices", {
      product: product.id,
      unit_amount: priceAmount,
      currency: "usd",
    });

    // Payment Link
    const paymentLink = await stripeRequest("payment_links", {
      "line_items[0][price]": price.id,
      "line_items[0][quantity]": "1",
      "after_completion[type]": "redirect",
      "after_completion[redirect][url]": `${process.env.NEXTAUTH_URL}/proposal-success?proposal=${proposal.id}`,
      "metadata[proposalId]": proposal.id,
      "metadata[proposalNumber]": proposal.proposalNumber,
      "invoice_creation[enabled]": "true",
      "invoice_creation[invoice_data][description]": `Payment for ${proposal.title}`,
      "invoice_creation[invoice_data][custom_fields][0][name]": "Proposal Number",
      "invoice_creation[invoice_data][custom_fields][0][value]":
        proposal.proposalNumber,
      "invoice_creation[invoice_data][metadata][proposalId]": proposal.id,
    });

    // Update proposal with link
    await prisma.proposal.update({
      where: { id: params.id },
      data: {
        stripePaymentLinkId: paymentLink.id,
        stripePaymentUrl: paymentLink.url,
      },
    });

    return NextResponse.json({
      paymentUrl: paymentLink.url,
      paymentLinkId: paymentLink.id,
    });
  } catch (error: any) {
    console.error("Error creating payment link:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment link" },
      { status: 500 }
    );
  }
}
