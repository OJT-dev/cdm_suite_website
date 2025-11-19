
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import ServicesClient from "./services-client";

export const metadata = {
  title: "Services | CDM Suite",
  description: "Browse and purchase our digital marketing services",
};

export default async function DashboardServicesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <ServicesClient user={user} />;
}
