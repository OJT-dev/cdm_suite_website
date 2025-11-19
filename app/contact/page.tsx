
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ContactHero from "@/components/contact/contact-hero";
import ContactForm from "@/components/contact/contact-form";
import ContactInfo from "@/components/contact/contact-info";

export const metadata = {
  title: "Contact CDM Suite - Get Your Free Digital Marketing Consultation",
  description: "Ready to grow your business? Contact CDM Suite for a free consultation. Talk to our experts about web design, digital marketing, and AI implementation services.",
};

export default function ContactPage() {
  return (
    <main>
      <Navigation />
      <ContactHero />
      <ContactForm />
      <ContactInfo />
      <Footer />
    </main>
  );
}
