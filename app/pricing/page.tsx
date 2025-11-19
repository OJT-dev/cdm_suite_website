
import { redirect } from "next/navigation";

export const metadata = {
  title: "Services & Pricing | CDM Suite",
  description: "Explore our complete digital marketing services including website maintenance, SEO, social media management, and more.",
};

export default function PricingPage() {
  redirect('/services');
}
