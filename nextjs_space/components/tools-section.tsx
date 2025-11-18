

"use client";

import Link from "next/link";
import { Sparkles, BarChart3, Zap, Shield, TrendingUp, ChevronRight, Mail, DollarSign, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ToolsSection = () => {
  const tools = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Website Auditor",
      description: "Get an instant, complete analysis of your website's SEO, performance, mobile friendliness, and security in under 60 seconds.",
      features: [
        "SEO Score & Recommendations",
        "Performance Analysis",
        "Mobile Responsiveness Check",
        "Security Vulnerabilities Scan"
      ],
      badge: "FEATURED",
      gradient: "from-primary to-secondary",
      bgGradient: "from-secondary/10 to-accent/10",
      href: "/auditor",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "ROI Calculator",
      description: "Calculate the potential return on investment for your marketing campaigns and see exactly how much you can earn.",
      features: [
        "Monthly ROI Projections",
        "Investment Breakdown",
        "Profit Analysis",
        "Growth Forecasting"
      ],
      badge: "POPULAR",
      gradient: "from-accent to-secondary",
      bgGradient: "from-accent/10 to-secondary/10",
      href: "/tools/roi-calculator",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "SEO Health Checker",
      description: "Comprehensive SEO analysis to identify issues and opportunities to improve your search rankings.",
      features: [
        "Keyword Analysis",
        "Meta Tags Review",
        "Content Optimization",
        "Technical SEO Check"
      ],
      badge: "FREE",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      href: "/tools/seo-checker",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Conversion Analyzer",
      description: "Understand your conversion funnel and identify opportunities to increase conversions and sales.",
      features: [
        "Funnel Visualization",
        "Drop-off Analysis",
        "Improvement Suggestions",
        "Benchmark Comparison"
      ],
      badge: "FREE",
      gradient: "from-indigo-500 to-blue-500",
      bgGradient: "from-indigo-50 to-blue-50",
      href: "/tools/conversion-analyzer",
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Subject Tester",
      description: "Test your email subject lines and predict open rates before hitting send to maximize engagement.",
      features: [
        "Open Rate Prediction",
        "Spam Score Check",
        "Character Count",
        "Best Practices Tips"
      ],
      badge: "FREE",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      href: "/tools/email-tester",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Budget Calculator",
      description: "Plan your marketing budget effectively based on your revenue and growth goals with industry benchmarks.",
      features: [
        "Revenue-Based Planning",
        "Channel Allocation",
        "ROI Expectations",
        "Industry Benchmarks"
      ],
      badge: "FREE",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      href: "/tools/budget-calculator",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Website Need Checker",
      description: "Find out if your business needs a website and calculate the ROI with our comprehensive 8-step assessment.",
      features: [
        "Business Assessment",
        "ROI Calculation",
        "Personalized Recommendations",
        "AI Website Builder Access"
      ],
      badge: "NEW",
      gradient: "from-teal-500 to-green-500",
      bgGradient: "from-teal-50 to-green-50",
      href: "/tools/website-need-checker",
    },
  ];

  return (
    <section id="tools" className="py-20 lg:py-28 bg-gradient-to-br from-white via-secondary/5 to-accent/5 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-secondary to-accent rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-gradient-to-br from-primary to-secondary rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="section-container relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-gray-700">Free Marketing Tools</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            7 Free Tools to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Grow Your Business</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access professional-grade marketing tools absolutely free. Get insights that typically cost thousands of dollars. No credit card required.
          </p>
        </div>

        {/* Featured Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {tools.map((tool, index) => (
            <Card key={index} className="group overflow-hidden border-2 border-gray-200 hover:border-primary transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2">
              <CardContent className="p-0">
                {/* Icon & Badge Header */}
                <div className={`bg-gradient-to-br ${tool.bgGradient} p-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className={`bg-gradient-to-r ${tool.gradient} text-white p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {tool.icon}
                    </div>
                    {tool.badge && (
                      <span className="bg-accent text-charcoal text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold">✓</span>
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={tool.href} className="block">
                    <Button 
                      size="lg"
                      className={`w-full bg-gradient-to-r ${tool.gradient} hover:shadow-xl transition-all duration-200 group`}
                    >
                      Try It Now - Free
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    ⚡ Instant results • No signup required
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Tools Button */}
        <div className="text-center mb-16">
          <Link href="/tools">
            <Button size="lg" variant="outline" className="bg-white hover:bg-gray-50 text-primary border-2 border-primary hover:border-secondary font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200 group">
              View All Free Tools
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Bottom CTA */}
        <div className="mt-4 text-center bg-gradient-to-r from-primary to-secondary rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Optimize Your Website?</h3>
          <p className="text-xl text-secondary/80 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using our free tools to improve their online presence and drive more conversions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auditor">
              <Button size="lg" variant="secondary" className="bg-accent text-charcoal hover:bg-accent/90 font-bold shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-accent">
                Start Your Free Audit Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white hover:text-charcoal border-2 border-white font-bold shadow-xl hover:shadow-2xl transition-all duration-200">
                Talk to an Expert
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
