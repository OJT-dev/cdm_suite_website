
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { FreeDashboard } from "@/components/dashboard/free-dashboard";
import { StarterDashboard } from "@/components/dashboard/starter-dashboard";
import { GrowthDashboard } from "@/components/dashboard/growth-dashboard";
import { ProDashboard } from "@/components/dashboard/pro-dashboard";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";

export const metadata = {
  title: "Dashboard | CDM Suite",
  description: "Manage your marketing campaigns and websites",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Ensure user has a tier (default to free if not set)
  const userTier = user.tier || "free";
  const userRole = user.role?.toUpperCase();

  // Show employee dashboard for admin/employee roles
  if (userRole === "ADMIN" || userRole === "EMPLOYEE") {
    return <EmployeeDashboard user={user} />;
  }

  // Redirect to onboarding if not completed
  if (!user.onboardingCompleted && userTier !== "free") {
    redirect("/dashboard/onboarding");
  }

  return (
    <>
      {userTier === "free" && <FreeDashboard user={user} />}
      {userTier === "starter" && <StarterDashboard user={user} />}
      {(userTier === "growth" || userTier === "pro" || userTier === "enterprise") && (
        <GrowthDashboard user={user} />
      )}
    </>
  );
}
