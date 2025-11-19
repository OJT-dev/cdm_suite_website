
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { NewAuditClient } from "./new-audit-client";

export const metadata = {
  title: "New Website Audit | CDM Suite Dashboard",
  description: "Run a new website audit from your dashboard",
};

export default async function NewAuditPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <NewAuditClient user={user} />;
}
