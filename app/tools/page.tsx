
import { Metadata } from "next";
import FreeToolsHub from "@/components/tools/free-tools-hub";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Free Digital Marketing Tools | CDM Suite",
  description: "Access powerful free tools to grow your business. ROI calculators, website auditors, SEO checkers, and more professional marketing tools at no cost.",
  keywords: "free marketing tools, roi calculator, website audit, seo checker, digital marketing tools",
};

export default function FreeToolsPage() {
  return (
    <>
      <Navigation />
      <FreeToolsHub />
      <Footer />
    </>
  );
}
