
import { Metadata } from "next";
import ConversionAnalyzerLanding from "@/components/tools/conversion-analyzer-landing";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Free Conversion Rate Analyzer | Optimize Your Funnel | CDM Suite",
  description: "Analyze your conversion funnel and identify drop-off points. Get actionable insights to increase conversions and revenue. Free professional analysis tool.",
  keywords: "conversion rate analyzer, funnel analysis, conversion optimization, cro tool, funnel optimizer",
};

export default function ConversionAnalyzerPage() {
  return (
    <>
      <Navigation />
      <ConversionAnalyzerLanding />
      <Footer />
    </>
  );
}
