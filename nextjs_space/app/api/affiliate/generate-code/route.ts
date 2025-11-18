

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Mark route as dynamic
export const dynamic = 'force-dynamic';

function generateAffiliateCode(name: string, email: string): string {
  const namePart = name?.split(" ")[0]?.toLowerCase().substring(0, 4) || "user";
  const emailPart = email.split("@")[0].substring(0, 4).toLowerCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePart}${emailPart}${randomPart}`.toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        name: true, 
        email: true, 
        affiliateCode: true 
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user already has a code, return it
    if (user.affiliateCode) {
      return NextResponse.json({ 
        affiliateCode: user.affiliateCode,
        isNew: false
      });
    }

    // Generate a unique affiliate code
    let affiliateCode = generateAffiliateCode(user.name || "", user.email);
    let attempts = 0;
    let codeExists = true;

    while (codeExists && attempts < 10) {
      const existing = await prisma.user.findUnique({
        where: { affiliateCode },
      });

      if (!existing) {
        codeExists = false;
      } else {
        affiliateCode = generateAffiliateCode(user.name || "", user.email);
        attempts++;
      }
    }

    if (codeExists) {
      return NextResponse.json(
        { error: "Failed to generate unique code" },
        { status: 500 }
      );
    }

    // Update user with affiliate code
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { affiliateCode },
      select: { affiliateCode: true },
    });

    return NextResponse.json({ 
      affiliateCode: updatedUser.affiliateCode,
      isNew: true
    });
  } catch (error) {
    console.error("Failed to generate affiliate code:", error);
    return NextResponse.json(
      { error: "Failed to generate affiliate code" },
      { status: 500 }
    );
  }
}
