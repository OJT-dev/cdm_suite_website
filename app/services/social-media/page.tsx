
"use client";

import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CalendlyScheduler from "@/components/calendly-scheduler";
import { ServiceCTAButtons } from "@/components/service-cta-buttons";
import { StickyCTAButton } from "@/components/sticky-cta-button";
import { Button } from "@/components/ui/button";
import { CheckCircle, Share2, TrendingUp, Users, Heart } from "lucide-react";
import Image from "next/image";
import { SOCIAL_MEDIA_TIERS } from "@/lib/pricing-tiers";

export default function SocialMediaPage() {
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
        serviceName="Social Media Management"
      />
      
      {/* Hero Section with Header Image */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <Image
              src="https://cdn.abacus.ai/images/c0201920-f2b3-4da8-b5e5-08cf4c08e5b5.png"
              alt="Social media management"
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
              <span className="text-primary font-semibold">📱 Social Media Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Build Your Brand Where
              <br />
              <span className="text-primary">Your Customers Are.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Social media done right means more than just posting. We create content that resonates, 
              build engaged communities, and turn followers into customers.
            </p>
            <ServiceCTAButtons
              serviceId={SOCIAL_MEDIA_TIERS[1].id}
              price={SOCIAL_MEDIA_TIERS[1].price}
              serviceName="Social Media Management"
              onScheduleClick={handleScheduleClick}
            />
          </header>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 pb-12 md:pb-20">
          
          {/* Why Us Section with Overlap */}
          <section className="relative z-10 -mt-24 max-w-4xl mx-auto mb-12 md:mb-20 bg-white p-8 md:p-10 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Strategy First, Posting Second.</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <p className="text-center text-gray-600 mb-10 text-lg">
              Anyone can post on social media. But creating content that actually drives business results? 
              That takes strategy, creativity, and consistent execution.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-gray-700">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Audience-Focused Content</h3>
                  <p className="text-gray-600">We create content that speaks to your audience's needs, not just what you want to say.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Consistent Growth</h3>
                  <p className="text-gray-600">Strategic posting schedules and engagement tactics that steadily grow your following.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Community Building</h3>
                  <p className="text-gray-600">We don't just broadcast - we engage, respond, and build real relationships with your audience.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Share2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Multi-Platform Expertise</h3>
                  <p className="text-gray-600">From Instagram to LinkedIn, we understand what works on each platform.</p>
                </div>
              </div>
            </div>
          </section>

          {/* What's Included Section */}
          <section className="mb-16 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What's Included</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Complete social media management so you can focus on running your business
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { title: "Content Strategy", desc: "Custom content calendar aligned with your business goals" },
                { title: "Content Creation", desc: "Professional graphics, captions, and hashtag research" },
                { title: "Scheduling & Posting", desc: "Optimal timing for maximum reach and engagement" },
                { title: "Community Management", desc: "Responding to comments and messages promptly" },
                { title: "Analytics & Reporting", desc: "Monthly insights on what's working and what's not" },
                { title: "Platform Management", desc: "Facebook, Instagram, LinkedIn, Twitter, and more" },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="mb-16 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Social Media Packages</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the right level of support for your business
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {SOCIAL_MEDIA_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`bg-white rounded-2xl shadow-xl p-8 flex flex-col h-full ${
                    tier.popular ? 'ring-2 ring-primary scale-105' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 text-sm mb-6 min-h-[48px]">{tier.description}</p>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                      <span className="text-gray-500 text-sm">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ServiceCTAButtons
                    serviceId={tier.id}
                    price={tier.price}
                    serviceName={`Social Media - ${tier.name}`}
                    onScheduleClick={handleScheduleClick}
                    className="w-full mt-auto"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA Section */}
          <section id="ctaSection" className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Grow Your Social Presence?</h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Let's build a social media strategy that drives real business results. Schedule your free consultation today.
            </p>
            {showScheduler ? (
              <div className="max-w-4xl mx-auto bg-white rounded-lg p-4">
                <CalendlyScheduler url="https://calendly.com/cdmsuite/consultation" />
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleScheduleClick}
                className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6"
              >
                Schedule Free Consultation
              </Button>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}
