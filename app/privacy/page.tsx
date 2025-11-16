
import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Shield, Lock, Eye, Database, Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | CDM Suite",
  description: "Read CDM Suite's Privacy Policy and learn how we protect your data",
};

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="section-container py-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600">
                Last updated: October 13, 2025
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 space-y-8">
              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      1. Information We Collect
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      We collect information that you provide directly to us, including:
                    </p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-16">
                  <li>Name, email address, phone number, and company information</li>
                  <li>Account credentials and profile information</li>
                  <li>Payment and billing information</li>
                  <li>Communications with us, including support inquiries</li>
                  <li>Marketing preferences and survey responses</li>
                  <li>Website analytics and usage data</li>
                </ul>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      2. How We Use Your Information
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      We use the information we collect to:
                    </p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-16">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your transactions and send related information</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, prevent, and address technical issues and fraud</li>
                  <li>Personalize your experience and deliver relevant content</li>
                </ul>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      3. Information Sharing
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      We may share your information in the following situations:
                    </p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-16">
                  <li>With service providers who perform services on our behalf</li>
                  <li>With analytics partners to improve our services</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a merger, sale, or acquisition</li>
                  <li>With your consent or at your direction</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4 ml-16">
                  We do not sell your personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Data Security
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4 mt-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Employee training on data protection</li>
                  <li>Secure payment processing through trusted providers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Cookies and Tracking Technologies
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Understand how you use our services</li>
                  <li>Improve our website performance</li>
                  <li>Deliver personalized content and advertisements</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  You can control cookies through your browser settings. However, disabling cookies may limit your 
                  ability to use certain features of our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Your Privacy Rights
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Access and receive a copy of your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to or restrict certain processing activities</li>
                  <li>Data portability (receive your data in a usable format)</li>
                  <li>Withdraw consent at any time</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Data Retention
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in 
                  this Privacy Policy, unless a longer retention period is required or permitted by law. When we no 
                  longer need your information, we will securely delete or anonymize it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Children's Privacy
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Our services are not directed to individuals under the age of 18. We do not knowingly collect 
                  personal information from children. If you believe we have collected information from a child, 
                  please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. International Data Transfers
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure 
                  appropriate safeguards are in place to protect your information in accordance with this Privacy 
                  Policy and applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Changes to This Policy
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by 
                  posting the new policy on this page and updating the "Last updated" date. We encourage you to 
                  review this policy periodically.
                </p>
              </section>

              <section>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      11. Contact Us
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our data 
                      practices, please contact us:
                    </p>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <p className="text-gray-700 font-medium mb-2">CDM Suite</p>
                      <p className="text-gray-600">Phone: (862) 272-7623</p>
                      <p className="text-gray-600">Email: privacy@cdmsuite.com</p>
                      <p className="text-gray-600 mt-3 text-sm">
                        Response time: We aim to respond to all privacy inquiries within 48 hours
                      </p>
                    </div>
                  </div>
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
