
 // NOTE: This route uses the Stripe Node SDK and currently requires the Node.js runtime.

 import { NextRequest, NextResponse } from "next/server";
 import { getServerSession } from "next-auth";
 import { authOptions } from "@/lib/auth";
 import Stripe from "stripe";

 export const runtime = "nodejs";

 let stripeClient: Stripe | null = null;

 function getStripeClient(): Stripe | null {
   const apiKey = process.env.STRIPE_SECRET_KEY;

   if (!apiKey) {
     console.error(
       "STRIPE_SECRET_KEY is not configured; credit purchase checkout is disabled.",
     );
     return null;
   }

   if (!stripeClient) {
     stripeClient = new Stripe(apiKey, {
       apiVersion: "2025-10-29.clover",
     });
   }

   return stripeClient;
 }

 export async function POST(request: NextRequest) {
   try {
     const session = await getServerSession(authOptions);

     if (!session?.user?.email) {
       return NextResponse.json(
         { error: "Unauthorized" },
         { status: 401 },
       );
     }

     const { packageId, credits, price } = await request.json();

     if (!packageId || !credits || !price) {
       return NextResponse.json(
         { error: "Missing required fields" },
         { status: 400 },
       );
     }

     const stripe = getStripeClient();

     if (!stripe) {
       return NextResponse.json(
         { error: "Payment service not configured" },
         { status: 500 },
       );
     }

     // Create Stripe checkout session for one-time payment
     const checkoutSession = await stripe.checkout.sessions.create({
       customer_email: session.user.email,
       line_items: [
         {
           price_data: {
             currency: "usd",
             product_data: {
               name: `${credits} Project Credits`,
               description: `Purchase ${credits} credits to create websites`,
             },
             unit_amount: price * 100, // Convert to cents
           },
           quantity: 1,
         },
       ],
       mode: "payment",
       success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=true&credits=${credits}`,
       cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?canceled=true`,
       metadata: {
         userId: session.user.id,
         credits: credits.toString(),
         packageId,
         type: "credit_purchase",
       },
     });

     return NextResponse.json({ url: checkoutSession.url });
   } catch (error: any) {
     console.error("Credit purchase error:", error);
     return NextResponse.json(
       { error: error.message || "Failed to create checkout session" },
       { status: 500 },
     );
   }
 }
