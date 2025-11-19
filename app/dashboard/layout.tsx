
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
