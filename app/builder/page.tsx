
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { BuilderClient } from "@/components/builder/builder-client";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "AI Website Builder | CDM Suite",
  description: "Build your professional website in minutes with AI",
};

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: { audit?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?callbackUrl=/builder");
  }

  // Check tier access
  if (user.tier === "free") {
    redirect("/dashboard?upgrade=true");
  }

  // Fetch audit data if provided
  let auditData = null;
  if (searchParams.audit) {
    const audit = await prisma.websiteAudit.findFirst({
      where: {
        id: searchParams.audit,
        userId: user.id
      }
    });
    if (audit) {
      auditData = {
        id: audit.id,
        websiteUrl: audit.websiteUrl,
        seoScore: audit.seoScore,
        performanceScore: audit.performanceScore,
        mobileScore: audit.mobileScore,
        securityScore: audit.securityScore,
        issues: JSON.parse(audit.issues),
        recommendations: JSON.parse(audit.recommendations)
      };
    }
  }

  return (
    <DashboardLayout user={user}>
      <BuilderClient user={user} auditData={auditData} />
    </DashboardLayout>
  );
}
