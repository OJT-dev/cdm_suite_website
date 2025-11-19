
"use client";

import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CalendlyScheduler from "@/components/calendly-scheduler";
import { StickyCTAButton } from "@/components/sticky-cta-button";
import { Button } from "@/components/ui/button";
import { CheckCircle, Brain, Zap, TrendingUp, Bot } from "lucide-react";
import Image from "next/image";

export default function AISolutionsPage() {
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
        serviceName="AI Solutions"
      />
      
      {/* Hero Section with Header Image */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <Image
              src="https://cdn.abacus.ai/images/ced69fa8-5742-4173-aafb-2e0f52e13d6a.png"
              alt="AI implementation services"
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
              <span className="text-primary font-semibold">🤖 AI Implementation Services</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Put AI to Work
              <br />
              <span className="text-primary">in Your Business.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              From chatbots to predictive analytics, we help businesses leverage AI to automate processes, 
              gain insights, and make smarter decisions. No hype, just practical AI solutions that drive results.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleScheduleClick}
                className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6"
              >
                Schedule Free Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/contact'}
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                Get Custom Quote
              </Button>
            </div>
          </header>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 pb-12 md:pb-20">
          
          {/* Why AI Section with Overlap */}
          <section className="relative z-10 -mt-24 max-w-4xl mx-auto mb-12 md:mb-20 bg-white p-8 md:p-10 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">AI That Makes Sense for Your Business.</h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <p className="text-center text-gray-600 mb-10 text-lg">
              AI isn't just for tech giants. We help businesses of all sizes implement practical AI solutions 
              that automate repetitive tasks, improve customer experiences, and unlock insights from data.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-gray-700">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Chatbots & Virtual Assistants</h3>
                  <p className="text-gray-600">24/7 customer support, lead qualification, and automated responses that feel human.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Predictive Analytics</h3>
                  <p className="text-gray-600">Forecast trends, identify opportunities, and make data-driven decisions with confidence.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Process Automation</h3>
                  <p className="text-gray-600">Free up your team by automating repetitive tasks and workflows.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Custom AI Solutions</h3>
                  <p className="text-gray-600">Tailored machine learning models trained on your specific business data and needs.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="mb-16 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Common AI Use Cases</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real-world applications of AI that businesses are using today
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { title: "Customer Service Chatbots", desc: "Instant responses to common questions, 24/7 availability" },
                { title: "Lead Scoring & Qualification", desc: "Automatically identify and prioritize your best leads" },
                { title: "Content Personalization", desc: "Show each visitor the most relevant content and offers" },
                { title: "Sales Forecasting", desc: "Predict future revenue and identify growth opportunities" },
                { title: "Inventory Optimization", desc: "Reduce costs by predicting demand and optimizing stock" },
                { title: "Sentiment Analysis", desc: "Monitor customer feedback and brand reputation at scale" },
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

          {/* Process Section */}
          <section className="mb-16 md:mb-24 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our AI Implementation Process</h2>
            </div>
            
            <div className="space-y-6">
              {[
                { num: "1", title: "Discovery", desc: "We analyze your business processes and identify opportunities for AI" },
                { num: "2", title: "Strategy", desc: "Develop a roadmap with clear goals, timeline, and success metrics" },
                { num: "3", title: "Development", desc: "Build and train AI models using your data and requirements" },
                { num: "4", title: "Testing", desc: "Rigorous testing to ensure accuracy and reliability" },
                { num: "5", title: "Deployment", desc: "Launch and integrate with your existing systems" },
                { num: "6", title: "Optimization", desc: "Continuous monitoring and improvement as we gather more data" },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-6 items-start bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA Section */}
          <section id="ctaSection" className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore AI for Your Business?</h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Let's discuss how AI can help you work smarter, not harder. Every project is custom-priced based on complexity and scope.
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
