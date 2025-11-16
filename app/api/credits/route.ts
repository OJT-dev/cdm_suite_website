

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// Get user's credit balance
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, tier: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Admins and employees have unlimited access
    const isAdminOrEmployee = user.role === "admin" || user.role === "employee";

    return NextResponse.json({ 
      credits: isAdminOrEmployee ? 999999 : user.credits,
      tier: user.tier,
      role: user.role,
      unlimited: isAdminOrEmployee
    });
  } catch (error) {
    console.error("Failed to fetch credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
