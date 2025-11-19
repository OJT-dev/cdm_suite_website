
"use client";

import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CalendlyScheduler from "@/components/calendly-scheduler";
import { ServiceCTAButtons } from "@/components/service-cta-buttons";
import { StickyCTAButton } from "@/components/sticky-cta-button";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, Target, BarChart3, Zap } from "lucide-react";
import Image from "next/image";
import { AD_MANAGEMENT_TIERS } from "@/lib/pricing-tiers";

export default function AdManagementPage() {
  const [showScheduler, setShowScheduler] = useState(false);

  const handleScheduleClick = () => {
    setShowScheduler(true);
    // Scroll to the CTA section smoothly
    setTimeout(() => {
      document.getElementById('ctaSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      <Navigation />
      <StickyCTAButton 
        onScheduleClick={handleScheduleClick}
        serviceName="Ad Management"
      />
      
      {/* Hero Section with Header Image */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <Image
              src="https://cdn.abacus.ai/images/c5dbf003-c21d-46d9-bde2-ea94af97ab30.png"
              alt="Team collaborating on ad campaigns"
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
              <span className="text-primary font-semibold">💰 Results-Driven Advertising</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Tired of Wasting Money on Ads? 
              <br />
              <span className="text-primary">Let's Turn Clicks Into Customers.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Think of us as your co-pilot for digital advertising. We handle the complex stuff, from the data and targeting to the constant tweaks, to make sure your budget finds real people who actually want what you sell. No more shouting into the void; just smart ads that work.
            </p>
            <ServiceCTAButtons
              serviceId={AD_MANAGEMENT_TIERS[1].id}
              price={AD_MANAGEMENT_TIERS[1].price}
              serviceName="Ad Management"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-3">More Than an Agency, We're Your Growth Team.</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <p className="text-center text-gray-600 mb-10 text-lg">
              Look, anyone can boost a post. The real magic is in the day-to-day work of testing, learning, and optimizing. That's where we come in. We genuinely plug into your business, acting like an in-house team that's obsessed with one thing: helping you grow.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-gray-700">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">We Speak Every Platform's Language</h3>
                  <p className="text-gray-600">Whether your customers are scrolling Instagram, searching on Google, or discovering trends on TikTok, we're there. We craft ads that feel native and engaging, not intrusive.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">We Focus on Real Results (ROAS)</h3>
                  <p className="text-gray-600">Vanity metrics like 'likes' are nice, but we chase the numbers that actually matter: leads, sales, and a healthy Return on Ad Spend. Every dollar is tracked, tested, and put to work for your bottom line.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">No-Jargon, Honest Reporting</h3>
                  <p className="text-gray-600">You'll never be in the dark. We provide simple, clear reports that show you what's working and what we're doing about it. You'll always know exactly how your campaigns are performing.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">We See the Bigger Picture</h3>
                  <p className="text-gray-600">A click is just the beginning. We look at the whole customer journey, from the ad to your landing page, to make sure the experience is seamless. It's how we turn curious clicks into happy customers.</p>
                </div>
              </div>
            </div>

            {/* Trust Badges - CRO */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-700">Meta Business Partner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-700">Google Ads Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-700">TikTok Marketing Partner</span>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section - CRO Optimized */}
          <section className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Investment Plans That Scale With You
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Whether you're just starting out or ready to dominate your market, we have a plan designed for your stage of growth.
            </p>
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-6 py-3 mb-8">
              <p className="text-sm text-blue-800">
                <strong>💡 Pro Tip:</strong> Ad spend budget is separate from management fees
              </p>
            </div>

            {/* Simple Pricing Display */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
              {AD_MANAGEMENT_TIERS.map((tier) => (
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
                    serviceName={`Ad Management - ${tier.name}`}
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
                  <span className="text-4xl">🚀</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Ready to See What Your Ads Can *Really* Do?
                </h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Hop on a free, no-strings-attached strategy call with us. We'll take a look at what you're doing now, listen to your goals, and give you some honest, actionable advice. It's a chat, not a sales pitch. Let's figure this out together.
                </p>
                <ServiceCTAButtons
                  serviceId={AD_MANAGEMENT_TIERS[1].id}
                  price={AD_MANAGEMENT_TIERS[1].price}
                  serviceName="Ad Management"
                  onScheduleClick={handleScheduleClick}
                />
                <p className="mt-6 text-sm text-gray-500">
                  ⏱️ 30-minute call • 📅 Choose your time • 🎁 Free audit included
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
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Common Questions</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-start gap-2">
                  <span className="text-primary">Q:</span>
                  Is the monthly ad spend included in your price?
                </h3>
                <p className="text-gray-600 pl-6">Great question! Our pricing is for our team's expertise—the strategy, management, and optimization. Your ad spend (the money that goes directly to Google, Meta, etc.) is a separate budget. We'll help you determine the right starting budget for your goals during our strategy call.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-start gap-2">
                  <span className="text-primary">Q:</span>
                  How long until I see results?
                </h3>
                <p className="text-gray-600 pl-6">We get it, you're excited to see a return! While you can start seeing traffic and data within days, it usually takes about 2-3 months to fully optimize campaigns for consistent, profitable results. The first month is all about gathering data and learning, then we scale what works.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-start gap-2">
                  <span className="text-primary">Q:</span>
                  How do you get access to my accounts?
                </h3>
                <p className="text-gray-600 pl-6">Your security and ownership are top priorities. We use a secure, professional process and will request partner-level access to your ad accounts (like Facebook Business Manager and Google Ads). This way, you always remain the owner of your accounts and data. We'll never ask for your personal login details.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}
