
"use client";

import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CalendlyScheduler from "@/components/calendly-scheduler";
import { ServiceCTAButtons } from "@/components/service-cta-buttons";
import { StickyCTAButton } from "@/components/sticky-cta-button";
import { Button } from "@/components/ui/button";
import { CheckCircle, Monitor, Smartphone, Zap, Code, Palette } from "lucide-react";
import Image from "next/image";
import { WEB_DEVELOPMENT_TIERS, WEBSITE_MAINTENANCE_TIERS } from "@/lib/pricing-tiers";

export default function WebDesignPage() {
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
        serviceName="Web Design"
      />
      
      {/* Hero Section with Header Image */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <Image
              src="https://cdn.abacus.ai/images/be17cb63-d612-45d4-a305-c4454951de60.png"
              alt="Modern web design workspace"
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
              <span className="text-primary font-semibold">🎨 Professional Web Design</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Websites That Work as Hard
              <br />
              <span className="text-primary">as Your Business.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Your website is often the first impression potential customers have of your business. We create custom, 
              responsive websites that not only look stunning but also convert visitors into customers.
            </p>
            <ServiceCTAButtons
              serviceId={WEB_DEVELOPMENT_TIERS[1].id}
              price={WEB_DEVELOPMENT_TIERS[1].price}
              serviceName="Web Design Services"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-3">More Than Just Pretty Pages.</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <p className="text-center text-gray-600 mb-10 text-lg">
              A beautiful website is useless if it doesn't bring you business. We design and develop websites with 
              a clear focus on user experience, conversion optimization, and your specific business goals.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-gray-700">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Mobile-First Design</h3>
                  <p className="text-gray-600">More people browse on phones than desktops. We build every site to look and function beautifully on any device.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Lightning Fast Performance</h3>
                  <p className="text-gray-600">Slow sites lose customers. We optimize every element for speed, keeping visitors engaged and improving your SEO.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Clean, Modern Code</h3>
                  <p className="text-gray-600">Built with the latest technologies and best practices, your website will be secure, scalable, and easy to maintain.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Your Brand, Amplified</h3>
                  <p className="text-gray-600">We don't use cookie-cutter templates. Every design is custom-crafted to reflect your unique brand identity.</p>
                </div>
              </div>
            </div>
          </section>

          {/* What's Included Section */}
          <section className="mb-16 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What's Included</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A complete web design package from discovery to launch
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { title: "Strategy & Planning", desc: "We start by understanding your business, goals, and target audience" },
                { title: "Custom Design", desc: "Unique, on-brand visuals that set you apart from competitors" },
                { title: "Responsive Development", desc: "Works flawlessly on desktop, tablet, and mobile devices" },
                { title: "SEO Foundation", desc: "Built-in optimization to help you rank in search results" },
                { title: "Content Integration", desc: "Your text, images, and media professionally placed and formatted" },
                { title: "Training & Support", desc: "Learn how to update your site with our easy-to-use tools" },
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Website Design Packages</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the package that fits your business needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {WEB_DEVELOPMENT_TIERS.map((tier) => (
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
                      <span className="text-gray-500 text-sm">one-time</span>
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
                    serviceName={`Web Design - ${tier.name}`}
                    onScheduleClick={handleScheduleClick}
                    className="w-full mt-auto"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Website Maintenance Section */}
          <section className="mb-16 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Keep Your Site Running Smoothly</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Monthly maintenance packages to keep your website secure, updated, and performing at its best
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {WEBSITE_MAINTENANCE_TIERS.map((tier) => (
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
                      <span className="text-3xl font-bold text-gray-900">${tier.price}</span>
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
                    serviceName={`Website Maintenance - ${tier.name}`}
                    onScheduleClick={handleScheduleClick}
                    className="w-full mt-auto"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA Section */}
          <section id="ctaSection" className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your Dream Website?</h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Let's create a website that drives real results for your business. Schedule your free consultation today.
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
