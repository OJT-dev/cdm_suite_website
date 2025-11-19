
import { Metadata } from "next";
import EmailTesterLanding from "@/components/tools/email-tester-landing";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Free Email Subject Line Tester | Predict Open Rates | CDM Suite",
  description: "Test your email subject lines before sending. Get open rate predictions, spam scores, and best practice recommendations. Optimize your email marketing.",
  keywords: "email subject line tester, email marketing tool, open rate predictor, spam score checker, email optimizer",
};

export default function EmailTesterPage() {
  return (
    <>
      <Navigation />
      <EmailTesterLanding />
      <Footer />
    </>
  );
}
