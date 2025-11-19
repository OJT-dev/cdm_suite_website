
import { Metadata } from "next";
import BudgetCalculatorLanding from "@/components/tools/budget-calculator-landing";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Free Marketing Budget Calculator | Plan Your Marketing Spend | CDM Suite",
  description: "Calculate your ideal marketing budget based on revenue and growth goals. Get channel allocation recommendations and ROI projections. Free professional tool.",
  keywords: "marketing budget calculator, budget planning, marketing spend, roi calculator, channel allocation",
};

export default function BudgetCalculatorPage() {
  return (
    <>
      <Navigation />
      <BudgetCalculatorLanding />
      <Footer />
    </>
  );
}
