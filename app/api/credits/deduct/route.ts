

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";


// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount = 1 } = body;

    // Get current user credits and role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, tier: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Admins and employees have unlimited access - skip credit deduction
    const isAdminOrEmployee = user.role === "admin" || user.role === "employee";
    
    if (isAdminOrEmployee) {
      return NextResponse.json({ 
        success: true,
        credits: 999999, // Display unlimited for admins/employees
        deducted: 0,
        unlimited: true
      });
    }

    // Check if user has enough credits
    if (user.credits < amount) {
      return NextResponse.json(
        { 
          error: "Insufficient credits",
          credits: user.credits,
          required: amount
        },
        { status: 400 }
      );
    }

    // Deduct credits
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: amount } },
      select: { credits: true },
    });

    return NextResponse.json({ 
      success: true,
      credits: updatedUser.credits,
      deducted: amount
    });
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    return NextResponse.json(
      { error: "Failed to deduct credits" },
      { status: 500 }
    );
  }
}
