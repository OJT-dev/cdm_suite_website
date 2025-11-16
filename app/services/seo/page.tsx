
"use client";

import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CalendlyScheduler from "@/components/calendly-scheduler";
import { ServiceCTAButtons } from "@/components/service-cta-buttons";
import { StickyCTAButton } from "@/components/sticky-cta-button";
import { Button } from "@/components/ui/button";
import { CheckCircle, Search, LineChart, Globe, TrendingUp } from "lucide-react";
import Image from "next/image";
import { SEO_TIERS } from "@/lib/pricing-tiers";

export default function SEOServicesPage() {
  const [showScheduler, setShowScheduler] = useState(false);

  const handleScheduleClick = () => {
    setShowScheduler(true);
    setTimeout(() => {
      document.getElementById('ctaSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      <Navigation />
      <StickyCTAButton 
        onScheduleClick={handleScheduleClick}
        serviceName="SEO Services"
      />
      
      {/* Hero Section with Header Image */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <Image
              src="https://cdn.abacus.ai/images/b30c1045-5d17-4203-a2d3-3079b2f34779.png"
              alt="Team working on SEO strategy"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900/80"></div>
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 md:py-32 z-10">
          <header className="text-center max-w-3xl mx-auto">
            <div className="inline-block bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-6">
              <span className="text-primary font-semibold">🔍 Strategic SEO Services</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Get Found by the Customers
              <br />
              <span className="text-primary">Looking for You.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Good SEO isn't about tricking Google. It's about making your website the best possible answer for your future customers. We handle the technical details and strategic content so you can connect with the people who need you most.
            </p>
            <ServiceCTAButtons
              serviceId={SEO_TIERS[1].id}
              price={SEO_TIERS[1].price}
              serviceName="SEO Services"
              onScheduleClick={handleScheduleClick}
            />
          </header>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 pb-12 md:pb-20">
          
          {/* Why Us Section with Overlap - CRO Optimized */}
          <section className="relative z-10 -mt-24 max-w-4xl mx-auto mb-12 md:mb-20 bg-white p-8 md:p-10 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">We Play the Long Game.</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <p className="text-center text-gray-600 mb-10 text-lg">
              SEO is a marathon, not a sprint. While others might promise instant #1 rankings with risky tactics, we focus on building a powerful, sustainable foundation for your website. We build your authority, earn trust with search engines, and create a lasting asset that brings in qualified traffic month after month.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-gray-700">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Focused on Your Bottom Line</h3>
                  <p className="text-gray-600">Ranking for a keyword is useless if it doesn't bring in business. We start by understanding your goals and target the keywords that your ideal customers are actually using.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">A Holistic Approach</h3>
                  <p className="text-gray-600">Great SEO doesn't live in a bubble. It works hand-in-hand with a well-designed website, quality content, and a smart user experience. We look at the whole picture to ensure success.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">No-Nonsense Reporting</h3>
                  <p className="text-gray-600">We believe in total transparency. Our reports are clear, easy to understand, and focus on the metrics that matter most: your traffic, your leads, and your growth.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Always Learning, Always Adapting</h3>
                  <p className="text-gray-600">Google's algorithm is always changing. Part of our job is to stay on top of the latest trends and updates to keep your strategy effective and ahead of the curve.</p>
                </div>
              </div>
            </div>

            {/* Trust Badges - CRO */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-700">Google Analytics Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-700">SEMrush Agency Partner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-700">Proven Track Record</span>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section - CRO Optimized */}
          <section className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find the Perfect SEO Plan for Your Business
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Whether you're just starting out or ready to scale, we have a plan designed for your stage of growth.
            </p>
            <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-6 py-3 mb-8">
              <p className="text-sm text-green-800">
                <strong>💡 Pro Tip:</strong> SEO is a long-term investment with compounding returns
              </p>
            </div>

            {/* Simple Pricing Display */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
              {SEO_TIERS.map((tier) => (
                <div 
                  key={tier.id}
                  className={`bg-white rounded-xl shadow-lg p-8 border-2 flex flex-col h-full ${
                    tier.popular ? 'border-primary' : 'border-gray-200 hover:border-primary'
                  } transition-all relative`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary">${tier.price.toLocaleString()}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="text-left space-y-3 mb-6 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ServiceCTAButtons
                    serviceId={tier.id}
                    price={tier.price}
                    serviceName={`SEO - ${tier.name}`}
                    onScheduleClick={handleScheduleClick}
                    variant="stacked"
                    className="mt-auto"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action Section */}
          <section id="ctaSection" className="text-center mt-16 md:mt-24 max-w-3xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            {!showScheduler ? (
              <div id="ctaContent">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📈</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Climb the Ranks?</h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Let's start with a free, no-obligation SEO audit. We'll analyze your website, identify your biggest opportunities, and give you a clear, actionable roadmap for growth. No hard sell, just honest advice.
                </p>
                <ServiceCTAButtons
                  serviceId={SEO_TIERS[1].id}
                  price={SEO_TIERS[1].price}
                  serviceName="SEO Services"
                  onScheduleClick={handleScheduleClick}
                />
                <p className="mt-6 text-sm text-gray-500">
                  ⏱️ 30-minute call • 🔍 Comprehensive audit • 📊 Action plan included
                </p>
              </div>
            ) : (
              <div id="scheduler">
                <CalendlyScheduler url="https://calendly.com/cdm-creativemedia/digital-marketing-power-session" />
              </div>
            )}
          </section>

          {/* FAQ Section - CRO Optimized */}
          <section className="max-w-3xl mx-auto mt-16 md:mt-24 border-t pt-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Your SEO Questions, Answered</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-start gap-2">
                  <span className="text-primary">Q:</span>
                  How long does it take to see results from SEO?
                </h3>
                <p className="text-gray-600 pl-6">This is the most common and important question! SEO is a long-term strategy. While you might see some positive movement in the first 2-3 months, significant, lasting results typically take 6-12 months to build. It's an investment that pays off with steady, "free" traffic over time.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-start gap-2">
                  <span className="text-primary">Q:</span>
                  Can you guarantee a #1 ranking on Google?
                </h3>
                <p className="text-gray-600 pl-6">No reputable SEO professional can or should guarantee a #1 spot. Google's algorithm is complex and constantly changing. What we can guarantee is that we will use the best, most up-to-date strategies to significantly improve your visibility, traffic, and rankings for the keywords that matter to your business.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-start gap-2">
                  <span className="text-primary">Q:</span>
                  What's the difference between on-page and off-page SEO?
                </h3>
                <p className="text-gray-600 pl-6">Think of it like this: On-page SEO is everything you control directly on your website (like content, keywords, site speed). Off-page SEO is about building your site's authority and reputation around the web (mostly through getting high-quality backlinks from other reputable sites).</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}
