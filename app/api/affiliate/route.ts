export const runtime = 'edge';



export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's affiliate data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        affiliateCode: true,
        affiliateEarnings: true,
        affiliateCommissionRate: true,
        referredBy: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get referral statistics
    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      totalReferrals: referrals.length,
      convertedReferrals: referrals.filter((r: any) => r.status === "converted" || r.status === "paid").length,
      pendingReferrals: referrals.filter((r: any) => r.status === "pending").length,
      totalEarnings: user.affiliateEarnings,
      unpaidEarnings: referrals
        .filter((r: any) => r.status === "converted")
        .reduce((sum: number, r: any) => sum + r.commissionAmount, 0),
    };

    return NextResponse.json({
      affiliateCode: user.affiliateCode,
      commissionRate: user.affiliateCommissionRate,
      referredBy: user.referredBy,
      earnings: user.affiliateEarnings,
      stats,
      referrals: referrals.map((r: any) => ({
        id: r.id,
        email: r.referredEmail,
        status: r.status,
        tier: r.tierPurchased,
        commission: r.commissionAmount,
        date: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch affiliate data:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate data" },
      { status: 500 }
    );
  }
}
