
"use client";

import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CalendlyScheduler from "@/components/calendly-scheduler";
import { ServiceCTAButtons } from "@/components/service-cta-buttons";
import { StickyCTAButton } from "@/components/sticky-cta-button";
import { Button } from "@/components/ui/button";
import { CheckCircle, Smartphone, Tablet, Code, Zap } from "lucide-react";
import Image from "next/image";
import { APP_CREATION_TIERS, APP_MAINTENANCE_TIERS } from "@/lib/pricing-tiers";

export default function AppDevelopmentPage() {
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
        serviceName="App Development"
      />
      
      {/* Hero Section with Header Image */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <Image
              src="https://cdn.abacus.ai/images/9f04f5ba-a634-414a-8344-b68ce3c2adf0.png"
              alt="Mobile app development"
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
              <span className="text-primary font-semibold">📱 Mobile App Development</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Bring Your App Idea
              <br />
              <span className="text-primary">to Life.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              From concept to launch, we build native and cross-platform mobile apps that engage users 
              and drive business growth. iOS, Android, or both - we've got you covered.
            </p>
            <ServiceCTAButtons
              serviceId={APP_CREATION_TIERS[1].id}
              price={APP_CREATION_TIERS[1].price}
              serviceName="App Development Services"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Built for Performance and User Experience.</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <p className="text-center text-gray-600 mb-10 text-lg">
              A great app is more than just code - it's about solving problems and creating experiences 
              that users love. We combine technical expertise with user-centered design.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-gray-700">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Native & Cross-Platform</h3>
                  <p className="text-gray-600">Build for iOS, Android, or both using the best technology for your needs and budget.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Fast & Responsive</h3>
                  <p className="text-gray-600">Optimized performance that keeps users engaged without draining battery or data.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Clean Architecture</h3>
                  <p className="text-gray-600">Scalable code built with best practices for easy maintenance and future updates.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Tablet className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Beautiful UI/UX</h3>
                  <p className="text-gray-600">Intuitive interfaces designed following platform guidelines and modern best practices.</p>
                </div>
              </div>
            </div>
          </section>

          {/* What's Included Section */}
          <section className="mb-16 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete App Development</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need from idea to app store launch
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { title: "Discovery & Planning", desc: "Define features, user flows, and technical requirements" },
                { title: "UI/UX Design", desc: "Beautiful, intuitive interfaces that users love" },
                { title: "Development", desc: "Clean, maintainable code built with modern frameworks" },
                { title: "Testing & QA", desc: "Rigorous testing across devices and scenarios" },
                { title: "App Store Launch", desc: "Submission and optimization for both iOS and Android" },
                { title: "Support & Updates", desc: "Ongoing maintenance to keep your app running smoothly" },
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">App Development Packages</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the package that matches your app complexity
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {APP_CREATION_TIERS.map((tier) => (
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
                      <span className="text-4xl font-bold text-gray-900">${tier.price.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm">starting</span>
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
                    serviceName={`App Development - ${tier.name}`}
                    onScheduleClick={handleScheduleClick}
                    className="w-full mt-auto"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* App Maintenance Section */}
          <section className="mb-16 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Keep Your App Running Smoothly</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Monthly maintenance packages to keep your app secure, updated, and performing at its best
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {APP_MAINTENANCE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`bg-white rounded-2xl shadow-xl p-6 flex flex-col h-full ${
                    tier.popular ? 'ring-2 ring-primary scale-105' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full inline-block mb-3">
                      Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 text-xs mb-4 min-h-[40px]">{tier.description}</p>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">${tier.price.toLocaleString()}</span>
                      <span className="text-gray-500 text-xs">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ServiceCTAButtons
                    serviceId={tier.id}
                    price={tier.price}
                    serviceName={`App Maintenance - ${tier.name}`}
                    onScheduleClick={handleScheduleClick}
                    className="w-full mt-auto"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA Section */}
          <section id="ctaSection" className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your App?</h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Let's turn your app idea into reality. Schedule a free consultation to discuss your project.
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
