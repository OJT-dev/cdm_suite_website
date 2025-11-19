

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AuditsClient } from "./audits-client";

export const metadata = {
  title: "Website Audits | CDM Suite",
  description: "View your website audit history and track improvements over time",
};

export default async function AuditsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <AuditsClient user={user} />;
}
