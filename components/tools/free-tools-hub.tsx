
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Calculator, 
  Search, 
  TrendingUp, 
  Mail, 
  DollarSign, 
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Globe,
  Target,
  Users,
  Zap,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  badge?: string;
  color: string;
  benefits: string[];
}

const tools: Tool[] = [
  {
    id: "roi-calculator",
    title: "ROI Calculator",
    description: "See exactly how much revenue you could generate with professional digital marketing services.",
    icon: Calculator,
    href: "/tools/roi-calculator",
    badge: "Most Popular",
    color: "from-accent to-secondary",
    benefits: [
      "Instant revenue projections",
      "Industry-standard benchmarks",
      "Conservative estimates",
      "12-month forecasting"
    ]
  },
  {
    id: "website-auditor",
    title: "Website Auditor",
    description: "Get a comprehensive analysis of your website's performance, SEO, security, and mobile optimization.",
    icon: Search,
    href: "/auditor",
    badge: "Featured",
    color: "from-blue-500 to-cyan-500",
    benefits: [
      "Full SEO analysis",
      "Performance scoring",
      "Mobile-friendly check",
      "Security assessment"
    ]
  },
  {
    id: "seo-checker",
    title: "SEO Health Checker",
    description: "Analyze your website's SEO performance and get actionable recommendations to rank higher.",
    icon: TrendingUp,
    href: "/tools/seo-checker",
    badge: "New",
    color: "from-green-500 to-emerald-500",
    benefits: [
      "Meta tag analysis",
      "Keyword optimization",
      "Backlink insights",
      "Technical SEO review"
    ]
  },
  {
    id: "email-tester",
    title: "Email Subject Line Tester",
    description: "Test your email subject lines and predict open rates before hitting send.",
    icon: Mail,
    href: "/tools/email-tester",
    color: "from-purple-500 to-pink-500",
    benefits: [
      "Open rate prediction",
      "Spam score check",
      "Character count",
      "Best practices tips"
    ]
  },
  {
    id: "budget-calculator",
    title: "Marketing Budget Calculator",
    description: "Plan your marketing budget effectively based on your revenue and growth goals.",
    icon: DollarSign,
    href: "/tools/budget-calculator",
    color: "from-orange-500 to-red-500",
    benefits: [
      "Revenue-based planning",
      "Channel allocation",
      "ROI expectations",
      "Industry benchmarks"
    ]
  },
  {
    id: "conversion-analyzer",
    title: "Conversion Rate Analyzer",
    description: "Understand your conversion funnel and identify opportunities to increase conversions.",
    icon: BarChart3,
    href: "/tools/conversion-analyzer",
    color: "from-indigo-500 to-blue-500",
    benefits: [
      "Funnel visualization",
      "Drop-off analysis",
      "Improvement suggestions",
      "Benchmark comparison"
    ]
  },
  {
    id: "website-need-checker",
    title: "Website Need Checker",
    description: "Find out if your business needs a website and calculate the ROI with our comprehensive assessment.",
    icon: Globe,
    href: "/tools/website-need-checker",
    badge: "New",
    color: "from-teal-500 to-green-500",
    benefits: [
      "Business assessment",
      "ROI calculation",
      "Personalized recommendations",
      "AI website builder access"
    ]
  }
];

const FreeToolsHub = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-primary to-charcoal">
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-[80px]"></div>
        </div>

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-none sm:backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="text-accent font-semibold">100% Free Professional Tools</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-4">
              Grow Your Business With
              <span className="block bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mt-2">
                Free Marketing Tools
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 leading-relaxed px-4">
              Access the same professional-grade tools we use for Fortune 500 companies. 
              No credit card required. No hidden fees. Just powerful insights to help you grow.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-charcoal font-bold px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 btn-glow touch-target w-full sm:w-auto"
                asChild
              >
                <a href="#tools">
                  <span>Browse All Tools</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-accent bg-white/10 text-white hover:bg-white hover:text-charcoal px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg transition-all duration-300 touch-target w-full sm:w-auto"
                asChild
              >
                <Link href="/contact">
                  Talk to an Expert
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: Shield, label: "Built by Experts", value: "15+ Yrs" },
              { icon: Target, label: "Real Campaign Data", value: "50+ Industries" },
              { icon: Zap, label: "Quick Analysis", value: "Under 60s" },
              { icon: CheckCircle, label: "No Credit Card", value: "100% Free" }
            ].map((stat, index) => (
              <div key={index} className="bg-charcoal/90 backdrop-blur-sm rounded-xl p-6 text-center border border-accent/30 shadow-lg">
                <stat.icon className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-gray-100">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="py-8 sm:py-12 sm:py-20 relative">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Choose Your Tool
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Each tool provides instant, actionable insights to help you make smarter marketing decisions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={tool.href}>
                  <Card className="h-full bg-white/5 backdrop-blur-none sm:backdrop-blur-sm border-white/10 hover:border-accent/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`bg-gradient-to-r ${tool.color} p-3 rounded-xl`}>
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        {tool.badge && (
                          <Badge className="bg-accent text-charcoal font-semibold">
                            {tool.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-white text-2xl mb-2">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-base">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {tool.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                            <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white font-bold shadow-lg hover:shadow-xl group-hover:translate-x-1 transition-all duration-300`}
                      >
                        Try It Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use Our Tools Section */}
      <section className="py-8 sm:py-12 sm:py-20 bg-gradient-to-r from-accent/10 to-secondary/10 backdrop-blur-none sm:backdrop-blur-sm">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Why Business Owners Trust Our Tools
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built by marketing professionals with 15+ years of hands-on experience helping businesses grow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Industry-Tested Methods",
                description: "Based on proven strategies and real-world campaign data from diverse industries."
              },
              {
                icon: Zap,
                title: "Quick Analysis",
                description: "Get actionable insights in under 60 seconds, helping you make faster decisions."
              },
              {
                icon: Globe,
                title: "Genuinely Free",
                description: "No credit card required. No hidden costs. We built these tools to help businesses succeed."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-none sm:backdrop-blur-sm rounded-xl p-8 text-center"
              >
                <div className="bg-gradient-to-r from-accent to-secondary p-4 rounded-xl w-fit mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-charcoal" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 sm:py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-accent to-secondary rounded-3xl p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-6">
              Need Expert Help Implementing Your Results?
            </h2>
            <p className="text-xl text-charcoal/80 mb-8 max-w-3xl mx-auto">
              Our tools show you what's possible. Our team makes it happen. Let's turn these insights into real revenue growth.
            </p>
            <Button
              size="lg"
              className="bg-charcoal hover:bg-charcoal/90 text-accent font-bold px-8 py-6 text-lg btn-breathe"
              asChild
            >
              <Link href="/contact">
                Get a Free Strategy Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FreeToolsHub;
