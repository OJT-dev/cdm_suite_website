
import { Metadata } from "next";
import SEOCheckerLanding from "@/components/tools/seo-checker-landing";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Free SEO Checker Tool | Analyze & Improve Your Rankings | CDM Suite",
  description: "Check your website's SEO health in seconds. Get actionable insights on keywords, meta tags, backlinks, and technical SEO. Free professional analysis.",
  keywords: "seo checker, seo analysis, seo audit, keyword checker, meta tags analyzer, seo tool",
};

export default function SEOCheckerPage() {
  return (
    <>
      <Navigation />
      <SEOCheckerLanding />
      <Footer />
    </>
  );
}
