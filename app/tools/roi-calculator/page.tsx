
import { Metadata } from "next";
import ROICalculatorLanding from "@/components/tools/roi-calculator-landing";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Free ROI Calculator | Predict Your Marketing Revenue | CDM Suite",
  description: "Calculate your potential return on investment with professional digital marketing. Get instant revenue projections based on conservative industry benchmarks. Free tool, no signup required.",
  keywords: "roi calculator, marketing roi, revenue calculator, digital marketing roi, business growth calculator",
};

export default function ROICalculatorPage() {
  return (
    <>
      <Navigation />
      <ROICalculatorLanding />
      <Footer />
    </>
  );
}
