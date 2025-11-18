
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, DollarSign, Users, ArrowRight, CheckCircle, Star, Award, Target, Zap, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import LoadingAnimation from "../loading-animation";
import FOMONotifications from "../fomo-notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trackRedditLead } from "@/lib/reddit-tracking";
import { trackConversion } from "@/lib/analytics";

const ROICalculatorLanding = () => {
  const [monthlyVisitors, setMonthlyVisitors] = useState(5000);
  const [conversionRate, setConversionRate] = useState(2);
  const [averageOrderValue, setAverageOrderValue] = useState(150);
  const [showResults, setShowResults] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showTripwire, setShowTripwire] = useState(false);
  const [tripwireOffer, setTripwireOffer] = useState<any>(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // Conservative improvement estimates
  const conversionImprovement = 1.5;
  const trafficImprovement = 1.3;

  // Current metrics
  const currentLeads = monthlyVisitors * (conversionRate / 100);
  const currentRevenue = currentLeads * averageOrderValue;

  // Projected metrics
  const projectedVisitors = monthlyVisitors * trafficImprovement;
  const projectedConversionRate = conversionRate * conversionImprovement;
  const projectedLeads = projectedVisitors * (projectedConversionRate / 100);
  const projectedRevenue = projectedLeads * averageOrderValue;

  // Growth metrics
  const additionalRevenue = projectedRevenue - currentRevenue;
  const yearlyAdditionalRevenue = additionalRevenue * 12;

  const handleCalculate = () => {
    setShowResults(true);
    setShowLeadForm(true);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      alert("Please enter your name and email");
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
          toolName: 'ROI Calculator',
          toolData: {
            monthlyVisitors,
            conversionRate,
            averageOrderValue
          },
          results: {
            traffic: monthlyVisitors,
            conversionRate,
            avgSale: averageOrderValue,
            currentRevenue,
            projectedRevenue,
            roi: Math.round(((projectedRevenue - currentRevenue) / currentRevenue) * 100),
            investment: Math.round(projectedRevenue * 0.15)
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Track lead conversion
        trackRedditLead(email);
        trackConversion('roi_calculator', undefined, 'USD', { email });
        
        setTripwireOffer(data.tripwireOffer);
        setShowTripwire(true);
        setShowLeadForm(false);
      } else {
        alert("Failed to send report. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert("Failed to send report. Please try again.");
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
        // Redirect to Stripe checkout
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-primary to-charcoal">
      <FOMONotifications />
      {/* Hero Section - Russell Brunson Style */}
      <section className="pt-20 sm:pt-24 md:pt-32 pb-6 sm:pb-8 md:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-accent rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-secondary rounded-full blur-[80px]"></div>
        </div>

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto px-4"
          >
            {/* Pre-headline */}
            <div className="inline-flex items-center gap-2 bg-accent/30 rounded-full px-4 sm:px-6 py-2 mb-3 sm:mb-4 md:mb-6">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
              <span className="text-accent font-semibold text-sm sm:text-base">Used by 10,000+ Business Owners</span>
            </div>

            {/* Main Headline - Problem/Promise */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
              Discover How Much
              <span className="block bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mt-1 sm:mt-2">
                Additional Revenue
              </span>
              You're Leaving on the Table
            </h1>

            {/* Sub-headline - Bridge */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-3 sm:mb-4 md:mb-6 leading-relaxed font-semibold">
              In the next 60 seconds, you'll see exactly how much money you could be making with the right digital marketing strategy.
            </p>

            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-3 sm:mb-4 md:mb-6">
              This free calculator has helped business owners identify over <span className="text-accent font-bold">$247M in missed revenue opportunities</span>. What about yours?
            </p>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center mb-4 sm:mb-6 md:mb-8">
              {[
                "★★★★★ 4.9/5 from 2,847 users",
                "Featured in Forbes & Entrepreneur",
                "Zero spam, 100% free forever"
              ].map((proof, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-200">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                  <span className="text-sm sm:text-base">{proof}</span>
                </div>
              ))}
            </div>

            {/* Arrow Down Indicator */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-accent"
            >
              <ArrowRight className="h-8 w-8 mx-auto rotate-90" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-6 sm:py-8 md:py-12 relative">
        <div className="section-container px-4">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start max-w-7xl mx-auto">
            {/* Left Side - Calculator Input */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl lg:sticky lg:top-24"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <div className="bg-gradient-to-r from-accent to-secondary p-2 rounded-xl flex-shrink-0">
                  <Calculator className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-charcoal" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Step 1: Enter Your Numbers</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">Takes 30 seconds</p>
                </div>
              </div>
              
              <div className="space-y-6 sm:space-y-6 sm:space-y-8">
                {/* Monthly Visitors */}
                <div>
                  <Label htmlFor="visitors" className="text-gray-900 font-semibold mb-2 block text-sm sm:text-base md:text-lg">
                    Monthly Website Visitors
                  </Label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-2">
                    <Slider
                      id="visitors"
                      min={100}
                      max={100000}
                      step={100}
                      value={[monthlyVisitors]}
                      onValueChange={(value) => setMonthlyVisitors(value[0])}
                      className="flex-1 touch-target"
                    />
                    <Input
                      type="number"
                      value={monthlyVisitors}
                      onChange={(e) => setMonthlyVisitors(Number(e.target.value))}
                      className="w-full sm:w-32 text-sm sm:text-base md:text-lg font-bold h-10 sm:h-10 sm:h-12"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    💡 Check Google Analytics or estimate based on your industry
                  </p>
                </div>

                {/* Conversion Rate */}
                <div>
                  <Label htmlFor="conversion" className="text-gray-900 font-semibold mb-2 block text-sm sm:text-base md:text-lg">
                    Current Conversion Rate (%)
                  </Label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-2">
                    <Slider
                      id="conversion"
                      min={0.5}
                      max={10}
                      step={0.1}
                      value={[conversionRate]}
                      onValueChange={(value) => setConversionRate(value[0])}
                      className="flex-1 touch-target"
                    />
                    <Input
                      type="number"
                      value={conversionRate}
                      onChange={(e) => setConversionRate(Number(e.target.value))}
                      className="w-full sm:w-32 text-sm sm:text-base md:text-lg font-bold h-10 sm:h-10 sm:h-12"
                      step="0.1"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    💡 Industry average is 2-3% (visitors who become customers)
                  </p>
                </div>

                {/* Average Order Value */}
                <div>
                  <Label htmlFor="aov" className="text-gray-900 font-semibold mb-2 block text-sm sm:text-base md:text-lg">
                    Average Customer Value ($)
                  </Label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-2">
                    <Slider
                      id="aov"
                      min={50}
                      max={5000}
                      step={10}
                      value={[averageOrderValue]}
                      onValueChange={(value) => setAverageOrderValue(value[0])}
                      className="flex-1 touch-target"
                    />
                    <Input
                      type="number"
                      value={averageOrderValue}
                      onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                      className="w-full sm:w-32 text-sm sm:text-base md:text-lg font-bold h-10 sm:h-10 sm:h-12"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    💡 Average revenue per customer or order value
                  </p>
                </div>

                <Button 
                  onClick={handleCalculate}
                  className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl btn-breathe btn-glow shadow-xl touch-target"
                >
                  <span>Show Me My Potential Revenue</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </Button>

                <p className="text-center text-xs text-gray-500">
                  🔒 Your information is safe. We never share or sell your data.
                </p>
              </div>
            </motion.div>

            {/* Right Side - Results & Benefits */}
            <div className="space-y-6 sm:space-y-8">
              {/* Results Section */}
              {showResults ? (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="bg-gradient-to-br from-accent/10 to-secondary/10 backdrop-blur-none sm:backdrop-blur-sm rounded-2xl p-8 border-2 border-accent/20"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-accent to-secondary p-3 rounded-xl">
                      <Target className="h-6 w-6 text-charcoal" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Your Revenue Potential</h3>
                      <p className="text-gray-300">Based on conservative estimates</p>
                    </div>
                  </div>
                  
                  {/* Big Number */}
                  <div className="bg-gradient-to-r from-accent to-secondary rounded-2xl p-8 mb-6 text-center">
                    <p className="text-charcoal text-lg font-semibold mb-2">You Could Generate An Additional</p>
                    <p className="text-5xl md:text-6xl font-bold text-charcoal mb-2">
                      {formatCurrency(yearlyAdditionalRevenue)}
                    </p>
                    <p className="text-charcoal text-xl font-semibold">Per Year With Professional Marketing</p>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="bg-white/10 border-white/20">
                      <CardContent className="p-6 text-center">
                        <DollarSign className="h-8 w-8 text-accent mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{formatCurrency(additionalRevenue)}</p>
                        <p className="text-sm text-gray-300">Additional Monthly Revenue</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 border-white/20">
                      <CardContent className="p-6 text-center">
                        <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{formatNumber(projectedLeads - currentLeads)}</p>
                        <p className="text-sm text-gray-300">More Customers/Month</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Lead Capture Form - Russell Brunson Style */}
                  {showLeadForm && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white rounded-xl p-6 mt-6"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Mail className="h-5 w-5 text-accent" />
                        <h4 className="text-xl font-bold text-gray-900">
                          Want a Detailed Roadmap to Achieve This?
                        </h4>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Enter your email and we'll send you a personalized action plan showing exactly how to reach these numbers.
                      </p>
                      <form onSubmit={handleLeadSubmit} className="space-y-4">
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
                          placeholder="Your Email Address *"
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
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold py-6 text-lg"
                        >
                          Send Me My Custom Roadmap
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </form>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Plus get a free 30-minute strategy call ($500 value)
                      </p>
                    </motion.div>
                  )}

                  {/* Tripwire Offer */}
                  {showTripwire && tripwireOffer && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-br from-accent to-secondary rounded-2xl p-8 text-charcoal shadow-2xl"
                    >
                      <div className="text-center mb-6">
                        <div className="inline-block bg-red-500 text-white font-bold text-sm px-4 py-2 rounded-full mb-4">
                          {tripwireOffer.urgency}
                        </div>
                        <h2 className="text-4xl font-bold mb-3">
                          🎉 Check Your Email!
                        </h2>
                        <p className="text-xl">
                          Your ROI report is on its way. But before you go...
                        </p>
                      </div>

                      <div className="bg-white/20 backdrop-blur-none sm:backdrop-blur-sm rounded-xl p-6 mb-6">
                        <h3 className="text-3xl font-bold mb-3">{tripwireOffer.title}</h3>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-5xl font-bold">${tripwireOffer.discountPrice}</span>
                          <div>
                            <span className="text-xl line-through opacity-75">${tripwireOffer.originalPrice}</span>
                            <span className="ml-2 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
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
                          className="bg-charcoal hover:bg-charcoal/90 text-white font-bold py-6 text-lg w-full"
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
                          className="bg-transparent border-2 border-charcoal text-charcoal hover:bg-charcoal/10 font-semibold py-6 text-lg w-full"
                          asChild
                        >
                          <Link href="/tools">
                            Maybe Later
                          </Link>
                        </Button>
                      </div>

                      <p className="text-center text-sm mt-4">
                        ⚡ {tripwireOffer.urgency} • 60-Day Money-Back Guarantee
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-none sm:backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center"
                >
                  <Calculator className="h-16 w-16 text-accent mx-auto mb-4 opacity-50" />
                  <p className="text-gray-300 text-lg">
                    👈 Enter your numbers to see your potential
                  </p>
                </motion.div>
              )}

              {/* Why Trust Us */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-none sm:backdrop-blur-sm rounded-2xl p-8"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Why These Numbers Are Accurate</h3>
                <div className="space-y-4">
                  {[
                    {
                      icon: Award,
                      title: "Based on Real Client Data",
                      description: "We've analyzed 1,000+ campaigns across 50+ industries"
                    },
                    {
                      icon: TrendingUp,
                      title: "Conservative Estimates",
                      description: "Our projections use industry benchmarks, not best-case scenarios"
                    },
                    {
                      icon: Zap,
                      title: "Proven System",
                      description: "The same strategies we use for Fortune 500 companies"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="bg-gradient-to-r from-accent to-secondary p-2 rounded-lg h-fit">
                        <item.icon className="h-5 w-5 text-charcoal" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white/5">
        <div className="section-container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-base sm:text-lg md:text-xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Real Results From Real Businesses
            </h2>
            <p className="text-base sm:text-lg md:text-base sm:text-lg md:text-xl text-gray-300">
              These companies used this calculator, then hired us to make it happen
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                company: "E-commerce Store",
                result: "+847% ROI in 6 months",
                quote: "The calculator showed $180K potential. We hit $220K in added revenue."
              },
              {
                name: "Mike R.",
                company: "SaaS Company",
                result: "+340% Lead Growth",
                quote: "Skeptical at first, but the projections were actually conservative."
              },
              {
                name: "Jennifer L.",
                company: "Local Service Business",
                result: "+$94K in 4 months",
                quote: "This calculator opened my eyes to what's possible. Best decision ever."
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
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-white text-lg font-semibold mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent font-bold text-lg">{testimonial.result}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="section-container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-accent to-secondary rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center"
          >
            <h2 className="text-base sm:text-lg md:text-xl lg:text-4xl font-bold text-charcoal mb-3 sm:mb-4 md:mb-6">
              Ready to Turn These Numbers Into Reality?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-charcoal/80 mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto">
              The calculator shows what's possible. Our team makes it happen. Book a free strategy session and let's build your roadmap to growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                size="lg"
                className="bg-charcoal hover:bg-charcoal/90 text-accent font-bold px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg"
                asChild
              >
                <Link href="/contact">
                  Get My Free Strategy Session
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-accent px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg"
                asChild
              >
                <Link href="/tools">
                  Try Another Free Tool
                </Link>
              </Button>
            </div>
            <p className="text-charcoal/60 text-xs sm:text-sm mt-3 sm:mt-4">
              💰 First 50 signups this month get a free marketing audit ($2,500 value)
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ROICalculatorLanding;
