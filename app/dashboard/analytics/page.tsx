
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AnalyticsDashboardClient } from "@/components/dashboard/analytics-dashboard-client";

export const metadata = {
  title: "Analytics | CDM Suite",
  description: "Track your performance and insights",
};

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <AnalyticsDashboardClient />;
}
