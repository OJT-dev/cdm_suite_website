
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import MiniOffer from "@/components/mini-offer";
import TrustIndicators from "@/components/trust-indicators";
import ServicesSection from "@/components/services-section";
import ClientSuccessStories from "@/components/client-success-stories";
import ROICalculator from "@/components/roi-calculator";
import ToolsSection from "@/components/tools-section";
import ProcessSection from "@/components/process-section";
import FAQSection from "@/components/faq-section";
import Footer from "@/components/footer";

export default function HomePage() {
  return (
    <main>
      <Navigation />
      <HeroSection />
      <MiniOffer />
      <TrustIndicators />
      <ServicesSection />
      <ClientSuccessStories />
      <ROICalculator />
      <ToolsSection />
      <ProcessSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
