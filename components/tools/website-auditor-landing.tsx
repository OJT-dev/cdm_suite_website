
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Smartphone, 
  Shield, 
  Zap,
  Target,
  Mail,
  Globe,
  ArrowRight,
  Award,
  BarChart3,
  Star,
  Sparkles,
  Lock,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import Link from "next/link";
import LoadingAnimation from "../loading-animation";
import { trackRedditLead } from "@/lib/reddit-tracking";
import { trackConversion } from "@/lib/analytics";
import FOMONotifications from "../fomo-notifications";

interface AuditResult {
  overall_score: number;
  seo_score: number;
  performance_score: number;
  mobile_score: number;
  security_score: number;
  findings: {
    critical: string[];
    warnings: string[];
    good: string[];
  };
  recommendations: string[];
  explanations: {
    overall: string;
    seo: string;
    performance: string;
    mobile: string;
    security: string;
  };
}

const WebsiteAuditorLanding = () => {
  const { data: session } = useSession();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error("Please enter a website URL");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error('Audit failed');

      const data = await response.json();
      setResult(data);
      setShowLeadForm(true);
    } catch (error) {
      toast.error("Failed to audit website. Please check the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          source: 'Website Auditor',
          tags: ['website-auditor', 'free-tool'],
          notes: `Audited: ${url}, Overall Score: ${result?.overall_score}/100, Critical Issues: ${result?.findings.critical.length || 0}`
        })
      });

      if (response.ok) {
        // Track lead conversion - dual tracking (client-side + server-side)
        trackRedditLead(email);
        trackConversion('website_auditor', undefined, 'USD', {
          email,
          url,
          score: result?.overall_score,
        });
        
        toast.success("Report sent! Check your email for the full analysis.");
        window.location.href = '/contact';
      }
    } catch (error) {
      toast.error("Failed to send report. Please try again.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-primary to-charcoal">
      <FOMONotifications />
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 md:pt-32 pb-6 sm:pb-8 md:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-[80px]"></div>
        </div>

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Pre-headline */}
            <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-none sm:backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400 font-semibold">Professional-Grade Website Analysis</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Is Your Website
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Costing You Customers?
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed font-semibold">
              Get a comprehensive website audit in 30 seconds and discover the hidden issues driving visitors away.
            </p>

            <p className="text-xl text-gray-400 mb-8">
              We've audited <span className="text-blue-400 font-bold">15,000+ websites</span> and found that 87% have critical issues they don't know about. Does yours?
            </p>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              {[
                "★★★★★ Rated 4.9/5",
                "15,000+ audits completed",
                "100% free, forever"
              ].map((proof, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-blue-400" />
                  <span className="text-sm">{proof}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Audit Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="bg-white shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleAudit} className="space-y-6">
                  <div>
                    <Label htmlFor="url" className="text-gray-900 font-semibold text-lg mb-3 block">
                      Enter Your Website URL
                    </Label>
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="url"
                          type="url"
                          placeholder="https://yourwebsite.com"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="pl-12 text-lg py-6"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            Audit My Site
                            <Search className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Lock className="h-4 w-4" />
                    <span>Your data is secure and will never be shared</span>
                  </div>
                </form>

                {/* What We Check */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">What We Analyze:</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { icon: Search, label: "SEO Optimization" },
                      { icon: Zap, label: "Page Speed" },
                      { icon: Smartphone, label: "Mobile Friendliness" },
                      { icon: Shield, label: "Security Issues" },
                      { icon: Target, label: "Conversion Optimization" },
                      { icon: BarChart3, label: "Performance Metrics" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              {/* Overall Score with Detailed Explanation */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-none sm:backdrop-blur-sm border-2 border-blue-500/20 mb-8">
                <CardContent className="p-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Your Website Score</h2>
                    <div className="text-8xl font-bold mb-4">
                      <span className={getScoreColor(result.overall_score)}>
                        {result.overall_score}
                      </span>
                      <span className="text-4xl text-gray-400">/100</span>
                    </div>
                    <Progress value={result.overall_score} className="h-3 mb-6" />
                  </div>
                  
                  {/* Detailed Explanation */}
                  <div className="bg-white/5 rounded-lg p-6 mt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">What This Score Means:</h3>
                        <p className="text-gray-300 leading-relaxed text-lg">
                          {result.explanations?.overall || "Your website's overall performance indicates areas for improvement."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FOMO Element */}
                  {result.overall_score < 85 && (
                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4 mt-6">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-orange-400 mt-1" />
                        <div>
                          <p className="text-white font-semibold mb-1">⚠️ Your Competition is Ahead</p>
                          <p className="text-gray-300 text-sm">
                            While you read this, competitors with higher scores are capturing YOUR customers. 
                            Every day you wait costs you an estimated ${Math.floor((85 - result.overall_score) * 50)} in lost revenue.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detailed Scores with Explanations */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  { label: "SEO", score: result.seo_score, icon: Search, key: "seo" },
                  { label: "Performance", score: result.performance_score, icon: Zap, key: "performance" },
                  { label: "Mobile", score: result.mobile_score, icon: Smartphone, key: "mobile" },
                  { label: "Security", score: result.security_score, icon: Shield, key: "security" }
                ].map((item, index) => (
                  <Card key={index} className="bg-white/10 backdrop-blur-none sm:backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <item.icon className={`h-8 w-8 ${getScoreColor(item.score)}`} />
                          <h3 className="text-xl font-bold text-white">{item.label}</h3>
                        </div>
                        <p className={`text-4xl font-bold ${getScoreColor(item.score)}`}>
                          {item.score}
                        </p>
                      </div>
                      <Progress value={item.score} className="h-2 mb-4" />
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {result.explanations?.[item.key as keyof typeof result.explanations] || 
                         `Your ${item.label.toLowerCase()} score indicates room for optimization.`}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Findings */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Critical Issues */}
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <XCircle className="h-6 w-6 text-red-500" />
                      <h3 className="text-xl font-bold text-white">Critical Issues</h3>
                    </div>
                    <Badge className="bg-red-500 mb-4">{result.findings.critical.length} Found</Badge>
                    <ul className="space-y-2">
                      {result.findings.critical.slice(0, 3).map((issue, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Warnings */}
                <Card className="bg-yellow-500/10 border-yellow-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="h-6 w-6 text-yellow-500" />
                      <h3 className="text-xl font-bold text-white">Warnings</h3>
                    </div>
                    <Badge className="bg-yellow-500 mb-4">{result.findings.warnings.length} Found</Badge>
                    <ul className="space-y-2">
                      {result.findings.warnings.slice(0, 3).map((warning, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Good Practices */}
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                      <h3 className="text-xl font-bold text-white">Good Practices</h3>
                    </div>
                    <Badge className="bg-green-500 mb-4">{result.findings.good.length} Found</Badge>
                    <ul className="space-y-2">
                      {result.findings.good.slice(0, 3).map((good, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{good}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Capture Form with Enhanced FOMO */}
              {showLeadForm && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl border-2 border-blue-200"
                >
                  {/* Urgency Banner */}
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-3 rounded-lg mb-6 font-bold">
                    🔥 LIMITED TIME: Free Detailed Report + Expert Consultation ($500 Value)
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="h-6 w-6 text-blue-500" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Get Your Complete Action Plan (FREE)
                    </h3>
                  </div>

                  {/* Value Proposition */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-bold text-gray-900 mb-3">Here's what you'll receive:</h4>
                    <div className="space-y-2">
                      {[
                        "✅ Detailed 15-page PDF report with every issue explained",
                        "✅ Step-by-step fix instructions (no technical knowledge needed)",
                        "✅ Priority ranking: Fix high-impact issues first",
                        "✅ ROI calculator: See potential revenue increase",
                        "✅ 30-min consultation with digital marketing expert",
                        "✅ Custom improvement roadmap for your business"
                      ].map((item, idx) => (
                        <p key={idx} className="text-gray-700 text-sm">{item}</p>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="text-lg py-6"
                      />
                      <Input
                        type="email"
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="text-lg py-6"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Get My Free Report + Consultation Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>

                  {/* Trust Indicators */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">15,000+</p>
                        <p className="text-xs text-gray-600">Reports Sent</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">4.9/5</p>
                        <p className="text-xs text-gray-600">Client Rating</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">24hrs</p>
                        <p className="text-xs text-gray-600">Response Time</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    🔒 Your data is 100% secure. We never share or sell your information.
                  </p>

                  {/* Scarcity Element */}
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-4 text-center">
                    <p className="text-sm text-yellow-800 font-semibold">
                      ⚡ Only 8 consultation slots available this week - Claim yours now!
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white/5">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Fix These Issues?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300">
              Every problem costs you money in lost customers and rankings
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Rank Higher on Google",
                description: "Fix SEO issues and watch your rankings climb. Our clients see an average 156% increase in organic traffic."
              },
              {
                icon: Zap,
                title: "Convert More Visitors",
                description: "A 1-second delay in page load can reduce conversions by 7%. Speed = Money."
              },
              {
                icon: Shield,
                title: "Protect Your Reputation",
                description: "Security vulnerabilities can destroy trust instantly. 84% won't return after a security warning."
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-none sm:backdrop-blur-sm rounded-xl p-8 text-center"
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-xl w-fit mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
                <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Companies Who Fixed Their Issues
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "David K.",
                company: "Tech Startup",
                result: "87% More Traffic",
                quote: "The audit revealed issues I didn't know existed. After fixing them, our traffic exploded."
              },
              {
                name: "Lisa M.",
                company: "E-commerce",
                result: "234% Revenue Increase",
                quote: "We were losing customers to slow load times. This audit saved our business."
              },
              {
                name: "Tom R.",
                company: "Service Business",
                result: "#1 Google Ranking",
                quote: "From page 3 to #1 in 4 months by following their recommendations."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-none sm:backdrop-blur-sm rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-blue-400 text-blue-400" />
                  ))}
                </div>
                <p className="text-white text-lg font-semibold mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-bold text-lg">{testimonial.result}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              Need Help Fixing Your Website?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Don't let technical issues cost you customers. Our team will fix everything and optimize your site for maximum conversions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 text-blue-600 font-bold px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg"
                asChild
              >
                <Link href="/contact">
                  Get Expert Help Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg"
                asChild
              >
                <Link href="/tools">
                  Try Another Tool
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WebsiteAuditorLanding;
