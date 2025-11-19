

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { SettingsClient } from "@/components/dashboard/settings-client";

export const metadata = {
  title: "Settings | CDM Suite",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <SettingsClient user={user} />;
}
