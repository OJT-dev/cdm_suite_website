
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, ArrowRight, Mail, Target, Users, DollarSign, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { trackRedditLead } from "@/lib/reddit-tracking";
import { trackConversion } from "@/lib/analytics";
import Link from "next/link";
import LoadingAnimation from "../loading-animation";
import FOMONotifications from "../fomo-notifications";

interface FunnelStage {
  name: string;
  visitors: number;
  conversionRate: number;
  dropOff: number;
}

interface AnalysisResult {
  stages: FunnelStage[];
  overallConversion: number;
  biggestLeaks: string[];
  improvements: { stage: string; potential: number }[];
  potentialRevenue: number;
}

const ConversionAnalyzerLanding = () => {
  const [visitors, setVisitors] = useState(10000);
  const [landingPageConv, setLandingPageConv] = useState(25);
  const [productPageConv, setProductPageConv] = useState(40);
  const [checkoutConv, setCheckoutConv] = useState(60);
  const [avgOrderValue, setAvgOrderValue] = useState(100);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showTripwire, setShowTripwire] = useState(false);
  const [tripwireOffer, setTripwireOffer] = useState<any>(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();

    setIsAnalyzing(true);

    // Calculate funnel stages with loading animation
    setTimeout(() => {
      const landingVisitors = visitors;
      const productVisitors = landingVisitors * (landingPageConv / 100);
      const checkoutVisitors = productVisitors * (productPageConv / 100);
      const completedOrders = checkoutVisitors * (checkoutConv / 100);

    const stages: FunnelStage[] = [
      {
        name: "Landing Page",
        visitors: landingVisitors,
        conversionRate: landingPageConv,
        dropOff: 100 - landingPageConv
      },
      {
        name: "Product Page",
        visitors: productVisitors,
        conversionRate: productPageConv,
        dropOff: 100 - productPageConv
      },
      {
        name: "Checkout",
        visitors: checkoutVisitors,
        conversionRate: checkoutConv,
        dropOff: 100 - checkoutConv
      },
      {
        name: "Completed Purchase",
        visitors: completedOrders,
        conversionRate: 100,
        dropOff: 0
      }
    ];

    const overallConversion = (completedOrders / landingVisitors) * 100;

    // Identify biggest leaks
    const biggestLeaks: string[] = [];
    if (landingPageConv < 30) biggestLeaks.push("Landing page has low engagement");
    if (productPageConv < 50) biggestLeaks.push("Product pages aren't converting");
    if (checkoutConv < 70) biggestLeaks.push("Cart abandonment is high");

    // Calculate improvement potential
    const improvements = [
      {
        stage: "Landing Page",
        potential: (landingVisitors * 0.10 * (productPageConv / 100) * (checkoutConv / 100)) * avgOrderValue
      },
      {
        stage: "Product Page",
        potential: (productVisitors * 0.15 * (checkoutConv / 100)) * avgOrderValue
      },
      {
        stage: "Checkout",
        potential: (checkoutVisitors * 0.20) * avgOrderValue
      }
    ];

    const potentialRevenue = improvements.reduce((sum, imp) => sum + imp.potential, 0);

    setResult({
      stages,
      overallConversion,
      biggestLeaks,
      improvements,
      potentialRevenue
    });
      setShowLeadForm(true);
      setIsAnalyzing(false);
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
          phone: phone || null,
          toolName: 'Conversion Analyzer',
          toolData: { visitors, landingPageConv, productPageConv, checkoutConv, avgOrderValue },
          results: result
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Track lead conversion
        trackRedditLead(email);
        trackConversion('conversion_analyzer', undefined, 'USD', { email });
        
        setTripwireOffer(data.tripwireOffer);
        setShowTripwire(true);
        setShowLeadForm(false);
        toast.success("✅ Your conversion optimization plan has been sent!");
      } else {
        toast.error("Failed to send plan. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send plan. Please try again.");
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


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: value < 100 ? 1 : 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-primary to-charcoal">
      <FOMONotifications />
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 md:pt-32 pb-6 sm:pb-8 md:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[80px]"></div>
        </div>

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-none sm:backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              <span className="text-indigo-400 font-semibold">Funnel Optimization</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Where Are You
              <span className="block bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Losing Customers?
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed font-semibold">
              Identify your biggest conversion leaks and discover exactly how much revenue you're losing every month.
            </p>

            <p className="text-xl text-gray-400 mb-12">
              Even small improvements in your funnel can add thousands in monthly revenue.
            </p>
          </motion.div>

          {/* Analyzer */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-white shadow-2xl sticky top-24">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Funnel Metrics</h3>
                  <form onSubmit={handleAnalyze} className="space-y-6">
                    <div>
                      <Label className="text-gray-900 font-semibold mb-2 block">
                        Monthly Visitors
                      </Label>
                      <Input
                        type="number"
                        value={visitors}
                        onChange={(e) => setVisitors(Number(e.target.value))}
                        className="text-lg"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-gray-900 font-semibold mb-2 block">
                        Landing → Product Page (%)
                      </Label>
                      <Input
                        type="number"
                        value={landingPageConv}
                        onChange={(e) => setLandingPageConv(Number(e.target.value))}
                        className="text-lg"
                        min="0"
                        max="100"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-gray-900 font-semibold mb-2 block">
                        Product Page → Checkout (%)
                      </Label>
                      <Input
                        type="number"
                        value={productPageConv}
                        onChange={(e) => setProductPageConv(Number(e.target.value))}
                        className="text-lg"
                        min="0"
                        max="100"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-gray-900 font-semibold mb-2 block">
                        Checkout → Purchase (%)
                      </Label>
                      <Input
                        type="number"
                        value={checkoutConv}
                        onChange={(e) => setCheckoutConv(Number(e.target.value))}
                        className="text-lg"
                        min="0"
                        max="100"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-gray-900 font-semibold mb-2 block">
                        Average Order Value ($)
                      </Label>
                      <Input
                        type="number"
                        value={avgOrderValue}
                        onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                        className="text-lg"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl"
                    >
                      Analyze My Funnel
                      <BarChart3 className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              {result ? (
                <>
                  {/* Overall Conversion */}
                  <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 backdrop-blur-none sm:backdrop-blur-sm border-2 border-indigo-500/20">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-2xl font-bold text-white mb-4">Overall Conversion Rate</h3>
                      <div className="text-6xl font-bold mb-2">
                        <span className={result.overallConversion >= 5 ? "text-green-500" : result.overallConversion >= 2 ? "text-yellow-500" : "text-red-500"}>
                          {result.overallConversion.toFixed(2)}%
                        </span>
                      </div>
                      <Progress value={result.overallConversion * 10} className="h-3 mb-4" />
                      <p className="text-gray-300 text-lg">
                        Industry average is 2-4%
                      </p>
                    </CardContent>
                  </Card>

                  {/* Funnel Stages */}
                  <Card className="bg-white/10 backdrop-blur-none sm:backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Your Funnel Breakdown</h3>
                      <div className="space-y-4">
                        {result.stages.map((stage, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                              <span className="text-white font-semibold">{stage.name}</span>
                              <span className="text-gray-300">{formatNumber(stage.visitors)} visitors</span>
                            </div>
                            {index < result.stages.length - 1 && (
                              <>
                                <Progress value={stage.conversionRate} className="h-2 mb-1" />
                                <div className="flex justify-between text-sm">
                                  <span className="text-green-400">{stage.conversionRate}% convert</span>
                                  <span className="text-red-400">{stage.dropOff}% drop off</span>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Potential Revenue */}
                  <Card className="bg-gradient-to-r from-indigo-500 to-blue-500">
                    <CardContent className="p-8 text-center">
                      <DollarSign className="h-12 w-12 text-white mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-white mb-2">Potential Additional Revenue</h3>
                      <p className="text-5xl font-bold text-white mb-2">
                        {formatCurrency(result.potentialRevenue)}
                      </p>
                      <p className="text-white/80 text-lg">Per Month with optimizations</p>
                    </CardContent>
                  </Card>

                  {/* Biggest Leaks */}
                  {result.biggestLeaks.length > 0 && (
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertCircle className="h-6 w-6 text-red-500" />
                          <h3 className="text-xl font-bold text-white">Biggest Issues</h3>
                        </div>
                        <ul className="space-y-2">
                          {result.biggestLeaks.map((leak, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-300">
                              <span className="text-red-500 mt-1">⚠</span>
                              <span>{leak}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lead Capture */}
                  {showLeadForm && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white rounded-2xl p-8"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Mail className="h-6 w-6 text-indigo-500" />
                        <h3 className="text-2xl font-bold text-gray-900">
                          Want a Detailed Optimization Plan?
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Get specific recommendations for each stage of your funnel, plus proven tactics to increase conversions by 30-50%.
                      </p>
                      <form onSubmit={handleLeadSubmit} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Input
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                          <Input
                            type="email"
                            placeholder="Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold py-6 text-lg"
                        >
                          Send Me My Optimization Plan
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </>
              ) : (
                <Card className="bg-white/5 backdrop-blur-none sm:backdrop-blur-sm border-white/10">
                  <CardContent className="p-12 text-center">
                    <Target className="h-16 w-16 text-indigo-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-300 text-lg">
                      Enter your funnel metrics to see where you're losing customers
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Plug the Leaks and Maximize Revenue?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Our CRO experts specialize in turning traffic into customers. We've helped businesses increase conversions by an average of 47%.
            </p>
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-indigo-600 font-bold px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg"
              asChild
            >
              <Link href="/contact">
                Get Professional CRO Help
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ConversionAnalyzerLanding;
