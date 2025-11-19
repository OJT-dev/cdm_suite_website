
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, TrendingUp, ArrowRight, CheckCircle, Mail, PieChart, Target, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { trackRedditLead } from "@/lib/reddit-tracking";
import { trackConversion } from "@/lib/analytics";
import Link from "next/link";
import LoadingAnimation from "../loading-animation";
import FOMONotifications from "../fomo-notifications";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface BudgetResult {
  totalBudget: number;
  channels: {
    name: string;
    percentage: number;
    amount: number;
    color: string;
  }[];
  expectedROI: number;
  projectedRevenue: number;
}

const BudgetCalculatorLanding = () => {
  const [annualRevenue, setAnnualRevenue] = useState(500000);
  const [growthGoal, setGrowthGoal] = useState(25);
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showTripwire, setShowTripwire] = useState(false);
  const [tripwireOffer, setTripwireOffer] = useState<any>(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate recommended budget (5-15% of revenue based on growth goals)
    const budgetPercentage = Math.min(15, 5 + (growthGoal / 10));
    const totalBudget = annualRevenue * (budgetPercentage / 100);

    // Channel allocation based on industry best practices
    const channels = [
      { name: "SEO & Content", percentage: 25, color: "#10b981" },
      { name: "Paid Ads (PPC)", percentage: 30, color: "#3b82f6" },
      { name: "Social Media", percentage: 20, color: "#8b5cf6" },
      { name: "Email Marketing", percentage: 10, color: "#f59e0b" },
      { name: "Video/Creative", percentage: 10, color: "#ec4899" },
      { name: "Analytics/Tools", percentage: 5, color: "#6b7280" }
    ].map(channel => ({
      ...channel,
      amount: totalBudget * (channel.percentage / 100)
    }));

    // Calculate expected ROI (conservative estimate)
    const expectedROI = 350 + (growthGoal * 5); // 350-500%
    const projectedRevenue = totalBudget * (expectedROI / 100);

    setResult({
      totalBudget,
      channels,
      expectedROI,
      projectedRevenue
    });
    setShowLeadForm(true);
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
          toolName: 'Budget Calculator',
          toolData: {
            annualRevenue,
            growthGoal
          },
          results: {
            recommendedBudget: result?.totalBudget || 0,
            expectedReturn: (result?.totalBudget || 0) * 3,
            expectedROI: 300,
            breakdown: result?.channels.reduce((acc: any, channel: any) => {
              acc[channel.name] = channel.amount;
              return acc;
            }, {}) || {}
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Track lead conversion
        trackRedditLead(email);
        trackConversion('budget_calculator', undefined, 'USD', { email });
        
        setTripwireOffer(data.tripwireOffer);
        setShowTripwire(true);
        setShowLeadForm(false);
        toast.success("✅ Your budget plan has been sent to your email!");
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
      const response = await fetch('/api/create-tripwire-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        alert('Failed to create checkout session. Please try again.');
        setProcessingCheckout(false);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to create checkout session. Please try again.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-primary to-charcoal">
      <FOMONotifications />
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 md:pt-32 pb-6 sm:pb-8 md:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500 rounded-full blur-[80px]"></div>
        </div>

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-none sm:backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <DollarSign className="h-5 w-5 text-orange-400" />
              <span className="text-orange-400 font-semibold">Smart Budget Planning</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Are You Wasting
              <span className="block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Your Marketing Budget?
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed font-semibold">
              Calculate the perfect marketing budget and see exactly how to allocate every dollar for maximum ROI.
            </p>

            <p className="text-xl text-gray-400 mb-12">
              Based on data from 1,000+ successful campaigns across every industry.
            </p>
          </motion.div>

          {/* Calculator */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-white shadow-2xl sticky top-24">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Business Metrics</h3>
                  <form onSubmit={handleCalculate} className="space-y-6 sm:space-y-8">
                    <div>
                      <Label className="text-gray-900 font-semibold mb-3 block text-lg">
                        Annual Revenue
                      </Label>
                      <div className="flex items-center gap-4 mb-3">
                        <Slider
                          min={50000}
                          max={10000000}
                          step={10000}
                          value={[annualRevenue]}
                          onValueChange={(value) => setAnnualRevenue(value[0])}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={annualRevenue}
                          onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                          className="w-40 text-lg font-bold"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(annualRevenue)} per year
                      </p>
                    </div>

                    <div>
                      <Label className="text-gray-900 font-semibold mb-3 block text-lg">
                        Growth Goal (%)
                      </Label>
                      <div className="flex items-center gap-4 mb-3">
                        <Slider
                          min={10}
                          max={100}
                          step={5}
                          value={[growthGoal]}
                          onValueChange={(value) => setGrowthGoal(value[0])}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={growthGoal}
                          onChange={(e) => setGrowthGoal(Number(e.target.value))}
                          className="w-32 text-lg font-bold"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        You want to grow by {growthGoal}% this year
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl"
                    >
                      Calculate My Budget
                      <DollarSign className="ml-2 h-5 w-5" />
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
                  {/* Total Budget */}
                  <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-none sm:backdrop-blur-sm border-2 border-orange-500/20">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-2xl font-bold text-white mb-4">Recommended Annual Budget</h3>
                      <div className="text-6xl font-bold text-white mb-2">
                        {formatCurrency(result.totalBudget)}
                      </div>
                      <p className="text-gray-300 text-lg">
                        {((result.totalBudget / annualRevenue) * 100).toFixed(1)}% of revenue
                      </p>
                    </CardContent>
                  </Card>

                  {/* ROI Projection */}
                  <Card className="bg-white/10 backdrop-blur-none sm:backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="h-6 w-6 text-orange-400" />
                        <h3 className="text-xl font-bold text-white">Expected Results</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Expected ROI</p>
                          <p className="text-3xl font-bold text-orange-400">{result.expectedROI}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Projected Revenue</p>
                          <p className="text-3xl font-bold text-white">{formatCurrency(result.projectedRevenue)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Channel Allocation */}
                  <Card className="bg-white/10 backdrop-blur-none sm:backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Recommended Channel Allocation</h3>
                      <div className="space-y-3">
                        {result.channels.map((channel, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-300">{channel.name}</span>
                              <span className="text-white font-bold">{formatCurrency(channel.amount)}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-500"
                                style={{
                                  width: `${channel.percentage}%`,
                                  backgroundColor: channel.color
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lead Capture */}
                  {showLeadForm && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white rounded-2xl p-8"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Mail className="h-6 w-6 text-orange-500" />
                        <h3 className="text-2xl font-bold text-gray-900">
                          Want a Detailed Marketing Plan?
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Get a comprehensive PDF breakdown with month-by-month execution plan and ROI projections. Plus, free consultation with our strategists.
                      </p>
                      <form onSubmit={handleLeadSubmit} className="space-y-4">
                        <Input
                          type="text"
                          placeholder="Your Name *"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                        <Input
                          type="email"
                          placeholder="Your Email *"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <Input
                          type="tel"
                          placeholder="Phone Number (Optional)"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 text-lg"
                        >
                          Send Me My Marketing Plan
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </form>
                    </motion.div>
                  )}

                  {/* Tripwire Offer */}
                  {showTripwire && tripwireOffer && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl"
                    >
                      <div className="text-center mb-6">
                        <div className="inline-block bg-yellow-400 text-charcoal font-bold text-sm px-4 py-2 rounded-full mb-4">
                          {tripwireOffer.urgency}
                        </div>
                        <h2 className="text-4xl font-bold mb-3">
                          🎉 Check Your Email!
                        </h2>
                        <p className="text-xl text-white/90">
                          Your budget plan is on its way. But before you go...
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-none sm:backdrop-blur-sm rounded-xl p-6 mb-6">
                        <h3 className="text-3xl font-bold mb-3">{tripwireOffer.title}</h3>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-5xl font-bold">${tripwireOffer.discountPrice}</span>
                          <div>
                            <span className="text-xl line-through opacity-75">${tripwireOffer.originalPrice}</span>
                            <span className="ml-2 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded">
                              Save ${tripwireOffer.savings}
                            </span>
                          </div>
                        </div>
                        <ul className="space-y-2 mb-6">
                          {tripwireOffer.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Button
                          size="lg"
                          className="bg-white hover:bg-gray-100 text-orange-600 font-bold py-6 text-lg w-full"
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
                </>
              ) : (
                <Card className="bg-white/5 backdrop-blur-none sm:backdrop-blur-sm border-white/10">
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="h-16 w-16 text-orange-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-300 text-lg">
                      Enter your metrics to see your recommended budget
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
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              Need Help Executing Your Marketing Strategy?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              We'll take your budget and turn it into campaigns that actually deliver ROI. No waste, no guesswork, just results.
            </p>
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-orange-600 font-bold px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg"
              asChild
            >
              <Link href="/contact">
                Let's Build Your Strategy
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BudgetCalculatorLanding;
