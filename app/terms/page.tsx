
import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Shield, FileText, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | CDM Suite",
  description: "Read CDM Suite's Terms of Service and understand our policies",
};

export default function TermsPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="section-container py-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Terms of Service
              </h1>
              <p className="text-lg text-gray-600">
                Last updated: October 13, 2025
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-accent" />
                  1. Agreement to Terms
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing and using CDM Suite's services, you agree to be bound by these Terms of Service 
                  and all applicable laws and regulations. If you do not agree with any of these terms, you are 
                  prohibited from using or accessing this site and our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Services Description
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  CDM Suite provides digital marketing services including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Website design and development</li>
                  <li>Mobile app development</li>
                  <li>Search Engine Optimization (SEO)</li>
                  <li>Social media marketing and management</li>
                  <li>Digital advertising campaigns</li>
                  <li>Content creation and strategy</li>
                  <li>Marketing automation and analytics</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. User Accounts
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When you create an account with us, you must provide accurate, complete, and current information. 
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Ensuring your contact information is current</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Payment Terms
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Payment for services is due according to your selected subscription plan:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Monthly subscriptions are billed on a recurring basis</li>
                  <li>All payments are final and non-refundable</li>
                  <li>Prices may change with 30 days notice</li>
                  <li>Payment must be made through our approved payment processors</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Cancellation and Payment Policy
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You may cancel your subscription at any time. Cancellations take effect at the end of the current 
                  billing period. All payments are final and non-refundable. For services with a trial period, you may 
                  cancel during the trial period without charge.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We are committed to your satisfaction and will work with you to ensure you achieve the results you're 
                  looking for. If you have concerns about our services, please contact us so we can address them directly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Intellectual Property
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  All content, features, and functionality of CDM Suite's services are owned by CDM Suite and 
                  protected by international copyright, trademark, and other intellectual property laws. Work 
                  products created for you become your property upon full payment, unless otherwise specified in 
                  your service agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Limitation of Liability
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  CDM Suite shall not be liable for any indirect, incidental, special, consequential, or punitive 
                  damages resulting from your use of or inability to use the service. Our total liability shall not 
                  exceed the amount you paid for the service in the past 12 months.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Service Modifications
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify or discontinue, temporarily or permanently, the service with or 
                  without notice. We shall not be liable to you or any third party for any modification, suspension, 
                  or discontinuance of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Acceptable Use Policy
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You agree not to use our services to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious code</li>
                  <li>Engage in spam or unsolicited communications</li>
                  <li>Impersonate others or misrepresent your affiliation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Privacy
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy 
                  to understand our practices regarding the collection and use of your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Governing Law
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the State of 
                  New Jersey, United States, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  12. Changes to Terms
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to update these Terms of Service at any time. We will notify you of any 
                  changes by posting the new Terms on this page and updating the "Last updated" date. Your continued 
                  use of the service after changes become effective constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  13. Contact Information
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <p className="text-gray-700 font-medium">CDM Suite</p>
                  <p className="text-gray-600">Phone: (862) 272-7623</p>
                  <p className="text-gray-600">Email: support@cdmsuite.com</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
