

import { prisma } from "./db";

// Credit allocation by tier
export const TIER_CREDITS = {
  free: 1,
  starter: 5,
  growth: 20,
  pro: 50,
  enterprise: 999, // Effectively unlimited
};

// Get credits for a tier
export function getCreditsForTier(tier: string): number {
  return TIER_CREDITS[tier as keyof typeof TIER_CREDITS] || TIER_CREDITS.free;
}

// Check if user has admin or employee role
export function isAdminOrEmployee(userRole?: string | null): boolean {
  return userRole === "admin" || userRole === "employee";
}

// Check if user has enough credits (admins and employees bypass this check)
export function hasEnoughCredits(userCredits: number, required: number = 1, userRole?: string | null): boolean {
  // Admins and employees have unlimited access
  if (isAdminOrEmployee(userRole)) {
    return true;
  }
  return userCredits >= required;
}

// Calculate credits to add when upgrading
export function getCreditsOnUpgrade(fromTier: string, toTier: string): number {
  const fromCredits = getCreditsForTier(fromTier);
  const toCredits = getCreditsForTier(toTier);
  return Math.max(0, toCredits - fromCredits);
}

// Deduct credits from user (admins and employees bypass deduction)
export async function deductCredits(userId: string, amount: number = 1, userRole?: string | null): Promise<boolean> {
  try {
    // Skip credit deduction for admins and employees
    if (isAdminOrEmployee(userRole)) {
      return true;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: amount,
        },
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    return false;
  }
}

// Add credits to user
export async function addCredits(userId: string, amount: number): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount,
        },
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to add credits:", error);
    return false;
  }
}
