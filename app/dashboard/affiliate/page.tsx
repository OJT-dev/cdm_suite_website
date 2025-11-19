

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AffiliateClient } from "@/components/dashboard/affiliate-client";

export const metadata = {
  title: "Affiliate Program | CDM Suite",
  description: "Earn commissions by referring customers to CDM Suite",
};

export default async function AffiliatePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <AffiliateClient user={user} />;
}
