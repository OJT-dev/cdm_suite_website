
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      tier: true,
      subscriptionStatus: true,
      company: true,
      phone: true,
      industry: true,
      credits: true,
      affiliateCode: true,
      onboardingCompleted: true,
      trialEndsAt: true,
      subscriptionEndsAt: true,
      createdAt: true,
      dailyMessageCount: true,
      lastMessageDate: true,
    },
  });

  return user;
}
