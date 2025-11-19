
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail, sendSignupNotification } from "@/lib/email";
import { getCreditsForTier } from "@/lib/credits";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, company, phone, tier = "free", referralCode } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Set trial end date for starter tier
    const trialEndsAt = tier === "starter" 
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      : null;

    // Get credits for the tier
    const credits = getCreditsForTier(tier);

    // Validate referral code if provided
    let referrerId = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { affiliateCode: referralCode },
        select: { id: true },
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Automatically assign employee role to @cdmsuite.com emails
    const isEmployee = email.endsWith('@cdmsuite.com');
    const userRole = isEmployee ? 'employee' : 'client';
    
    // Employees get enterprise tier and unlimited credits automatically
    const finalTier = isEmployee ? 'enterprise' : tier;
    const finalCredits = isEmployee ? 999999 : credits;
    const finalSubscriptionStatus = isEmployee ? 'active' : (tier === "starter" ? "trialing" : "inactive");

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company: company || (isEmployee ? 'CDM Suite' : company),
        phone,
        tier: finalTier,
        subscriptionStatus: finalSubscriptionStatus,
        trialEndsAt: isEmployee ? null : trialEndsAt,
        credits: finalCredits,
        referredBy: referralCode || null,
        role: userRole,
      },
    });

    // Create employee profile for @cdmsuite.com emails
    if (isEmployee) {
      await prisma.employee.create({
        data: {
          userId: user.id,
          employeeRole: 'account_manager', // Default role, can be changed by admin
          department: 'sales', // Default department, can be changed by admin
          status: 'active',
          hireDate: new Date(),
          capabilities: JSON.stringify({
            canViewLeads: true,
            canCreateLeads: true,
            canEditLeads: true,
            canViewAllProjects: true,
          }),
        },
      });
    }

    // Create referral record if user was referred
    if (referrerId) {
      await prisma.referral.create({
        data: {
          referrerId,
          referredEmail: email,
          referredUserId: user.id,
          status: "pending",
        },
      });
    }

    // Send welcome email to user in background
    sendWelcomeEmail({
      email: user.email,
      name: user.name || "there",
      tier: user.tier,
    }).catch(console.error);

    // Send signup notification to admin in background
    sendSignupNotification({
      email: user.email,
      name: user.name || "New User",
      tier: user.tier,
      company: user.company || undefined,
      phone: user.phone || undefined,
      referralCode: referralCode || undefined,
    }).catch(console.error);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
