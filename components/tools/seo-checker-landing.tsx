"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Search, ArrowRight, CheckCircle, Star, AlertCircle, Globe, FileText, Link as LinkIcon, Award, Target, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { trackRedditLead } from "@/lib/reddit-tracking";
import { trackConversion } from "@/lib/analytics";
import Link from "next/link";
import LoadingAnimation from "../loading-animation";
import FOMONotifications from "../fomo-notifications";

interface SEOResult {
  score: number;
  titleTag: { exists: boolean; length: number; optimized: boolean };
  metaDescription: { exists: boolean; length: number; optimized: boolean };
  headings: { h1Count: number; h2Count: number; optimized: boolean };
  keywords: { density: number; distribution: string };
  issues: string[];
  recommendations: string[];
}

const SEOCheckerLanding = () => {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SEOResult | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showTripwire, setShowTripwire] = useState(false);
  const [tripwireOffer, setTripwireOffer] = useState<any>(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !keyword) {
      toast.error("Please enter both URL and target keyword");
      return;
    }

    setIsLoading(true);
    
    // Simulate SEO check with loading animation
    setTimeout(() => {
      const mockResult: SEOResult = {
        score: Math.floor(Math.random() * 40) + 50,
        titleTag: {
          exists: true,
          length: 58,
          optimized: Math.random() > 0.5
        },
        metaDescription: {
          exists: true,
          length: 142,
          optimized: Math.random() > 0.3
        },
        headings: {
          h1Count: 1,
          h2Count: 5,
          optimized: Math.random() > 0.4
        },
        keywords: {
          density: 2.5,
          distribution: "Good"
        },
        issues: [
          "Missing alt text on 3 images",
          "Page load time is 3.2s (should be under 2s)",
          "No schema markup found",
          "Internal linking structure needs improvement"
        ],
        recommendations: [
          "Add target keyword to H1 heading",
          "Optimize images for faster loading",
          "Create more internal links to this page",
          "Add FAQ schema markup",
          "Improve content length (current: 450 words, target: 1500+)"
        ]
      };
      
      setResult(mockResult);
      setShowLeadForm(true);
      setIsLoading(false);
    }, 4000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast.error("Please enter your name and email");
      return;
    }
    
    try {
      const response = await fetch('/api/send-tool-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          phone: phone || null, // Phone is optional
          toolName: 'SEO Checker',
          toolData: { url, keyword },
          results: result
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Track lead conversion
        trackRedditLead(email);
        trackConversion('seo_checker', undefined, 'USD', { email });
        
        setTripwireOffer(data.tripwireOffer);
        setShowTripwire(true);
        setShowLeadForm(false);
        toast.success("✅ Your detailed SEO report has been sent to your email!");
      } else {
        toast.error("Failed to send report. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send report. Please try again.");
    }
  };

  const handleTripwireCheckout = async () => {
    if (!tripwireOffer) return;
    
    setProcessingCheckout(true);
    
    try {
      const response = await fetch("/api/create-tripwire-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerName: tripwireOffer.offerName,
          amount: tripwireOffer.discountPrice,
          originalPrice: tripwireOffer.originalPrice,
          customerEmail: email,
          customerName: name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        toast.error("Failed to create checkout session. Please try again.");
        setProcessingCheckout(false);
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to create checkout session. Please try again.");
      setProcessingCheckout(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <LoadingAnimation 
            toolName="SEO Analysis"
            messages={[
              '🔍 Scanning your website...',
              '📊 Analyzing SEO factors...',
              '🎯 Checking keyword optimization...',
              '✨ Generating recommendations...'
            ]}
            duration={4000}
          />
        )}
      </AnimatePresence>
      
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-primary to-charcoal">
      <FOMONotifications />
        {/* Hero Section */}
        <section className="pt-24 md:pt-32 pb-8 md:pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-[80px]"></div>
        </div>

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-green-400/30">
              <TrendingUp className="h-5 w-5 text-white" />
              <span className="text-white font-semibold drop-shadow-lg">Rank Higher on Google</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight px-2">
              Is Your Website
              <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Invisible to Google?
              </span>
            </h1>

            <p className="text-xl sm:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 md:mb-8 leading-relaxed font-semibold px-2">
              Find out in 30 seconds what's keeping you off page 1 and how to fix it.
            </p>

            <p className="text-base md:text-lg lg:text-xl text-gray-400 mb-6 md:mb-8 px-4">
              93% of online experiences start with a search engine. If you're not on page 1, you're invisible.
            </p>
          </motion.div>

          {/* SEO Check Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto px-4"
          >
            <Card className="bg-white shadow-2xl">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleCheck} className="space-y-6">
                  <div>
                    <Label htmlFor="url" className="text-gray-900 font-semibold text-lg mb-3 block">
                      Your Website URL
                    </Label>
                    <div className="relative">
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
                  </div>

                  <div>
                    <Label htmlFor="keyword" className="text-gray-900 font-semibold text-lg mb-3 block">
                      Target Keyword
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="keyword"
                        type="text"
                        placeholder="e.g., digital marketing services"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="pl-12 text-lg py-6"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl"
                  >
                    {isLoading ? "Analyzing SEO..." : "Check My SEO"}
                    <Search className="ml-2 h-5 w-5" />
                  </Button>
                </form>
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
              className="max-w-6xl mx-auto space-y-6 sm:space-y-8"
            >
              {/* Score Card */}
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-none sm:backdrop-blur-sm border-2 border-green-500/20">
                <CardContent className="p-8 text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">Your SEO Score</h2>
                  <div className="text-8xl font-bold mb-4">
                    <span className={result.score >= 80 ? "text-green-500" : result.score >= 60 ? "text-yellow-500" : "text-red-500"}>
                      {result.score}
                    </span>
                    <span className="text-4xl text-gray-400">/100</span>
                  </div>
                  <Progress value={result.score} className="h-3 mb-4" />
                  <p className="text-base sm:text-lg md:text-xl text-gray-300">
                    {result.score >= 80 ? "Great! But there's still room for improvement." :
                     result.score >= 60 ? "Good start, but you're missing opportunities." :
                     "Your competitors are ranking higher. Let's fix this."}
                  </p>
                </CardContent>
              </Card>

              {/* Issues & Recommendations */}
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                      <h3 className="text-xl font-bold text-white">Issues Found</h3>
                    </div>
                    <ul className="space-y-3">
                      {result.issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-red-500 mt-1">✕</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <h3 className="text-xl font-bold text-white">Quick Wins</h3>
                    </div>
                    <ul className="space-y-3">
                      {result.recommendations.slice(0, 4).map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Capture */}
              {showLeadForm && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl p-8 max-w-2xl mx-auto"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="h-6 w-6 text-green-500" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Want a Step-by-Step SEO Roadmap?
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Get a detailed PDF showing exactly how to fix every issue and outrank your competitors. Plus, schedule a free consultation with our SEO experts.
                  </p>
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <Input
                        type="text"
                        placeholder="Your Name *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="text-lg"
                      />
                      <Input
                        type="email"
                        placeholder="Your Email *"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="text-lg"
                      />
                      <Input
                        type="tel"
                        placeholder="Phone Number (Optional)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="text-lg"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 text-lg"
                    >
                      Send Me My SEO Roadmap
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    🎁 Plus get a free competitor analysis ($750 value)
                  </p>
                </motion.div>
              )}

              {/* Tripwire Offer */}
              {showTripwire && tripwireOffer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-8 max-w-3xl mx-auto text-white shadow-2xl"
                >
                  <div className="text-center mb-6">
                    <Badge className="bg-white text-green-600 font-bold text-sm px-4 py-1 mb-4">
                      {tripwireOffer.urgency}
                    </Badge>
                    <h2 className="text-4xl font-bold mb-3">
                      🎉 Check Your Email!
                    </h2>
                    <p className="text-xl text-white/90">
                      Your SEO report is on its way. But before you go...
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-none sm:backdrop-blur-sm rounded-xl p-6 mb-6">
                    <h3 className="text-3xl font-bold mb-3">{tripwireOffer.title}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-5xl font-bold">${tripwireOffer.discountPrice}</span>
                      <div>
                        <span className="text-xl line-through opacity-75">${tripwireOffer.originalPrice}</span>
                        <Badge className="ml-2 bg-red-500 text-white">Save ${tripwireOffer.savings}</Badge>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {tripwireOffer.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Button
                      size="lg"
                      className="bg-white hover:bg-gray-100 text-green-600 font-bold py-6 text-lg w-full"
                      onClick={handleTripwireCheckout}
                      disabled={processingCheckout}
                    >
                      {processingCheckout ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {tripwireOffer.cta}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-6 text-lg w-full"
                      asChild
                    >
                      <Link href="/tools">
                        Maybe Later
                      </Link>
                    </Button>
                  </div>

                  <p className="text-center text-sm text-white/80 mt-4">
                    ⚡ {tripwireOffer.urgency} • 60-Day Money-Back Guarantee
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Dominate Page 1?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Our SEO experts have helped 500+ businesses reach the top of Google. Let us do the same for you.
            </p>
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-green-600 font-bold px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg"
              asChild
            >
              <Link href="/contact">
                Get Professional SEO Help
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
};

export default SEOCheckerLanding;
