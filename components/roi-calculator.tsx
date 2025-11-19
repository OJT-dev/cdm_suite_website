
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, DollarSign, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import LoadingAnimation from "./loading-animation";

const ROICalculator = () => {
  const [monthlyVisitors, setMonthlyVisitors] = useState(5000);
  const [conversionRate, setConversionRate] = useState(2);
  const [averageOrderValue, setAverageOrderValue] = useState(150);
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Conservative improvement estimates based on industry benchmarks
  const conversionImprovement = 1.5; // 50% improvement (conservative)
  const trafficImprovement = 1.3; // 30% improvement (conservative)

  // Current metrics
  const currentLeads = monthlyVisitors * (conversionRate / 100);
  const currentRevenue = currentLeads * averageOrderValue;

  // Projected metrics with CDM Suite
  const projectedVisitors = monthlyVisitors * trafficImprovement;
  const projectedConversionRate = conversionRate * conversionImprovement;
  const projectedLeads = projectedVisitors * (projectedConversionRate / 100);
  const projectedRevenue = projectedLeads * averageOrderValue;

  // Growth metrics
  const additionalLeads = projectedLeads - currentLeads;
  const additionalRevenue = projectedRevenue - currentRevenue;
  const yearlyAdditionalRevenue = additionalRevenue * 12;

  const handleCalculate = () => {
    setIsCalculating(true);
    // Simulate calculation time for better UX
    setTimeout(() => {
      setIsCalculating(false);
      setShowResults(true);
    }, 3000);
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
    <>
      <AnimatePresence>
        {isCalculating && (
          <LoadingAnimation 
            toolName="ROI Analysis"
            messages={[
              '💰 Calculating revenue potential...',
              '📈 Analyzing growth metrics...',
              '🎯 Forecasting conversions...',
              '✨ Preparing your custom report...'
            ]}
            duration={3000}
          />
        )}
      </AnimatePresence>
      
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-charcoal to-charcoal relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full filter blur-3xl"></div>
      </div>

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12 px-4"
        >
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 mb-4 md:mb-6">
            <Calculator className="h-4 w-4 md:h-5 md:w-5 text-accent" />
            <span className="text-accent font-semibold text-sm md:text-base">Interactive ROI Calculator</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
            See Your Potential ROI With CDM Suite
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
            Get a realistic estimate of how much additional revenue you could generate with 
            our digital marketing services. These projections are based on conservative industry benchmarks.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start px-4">
          {/* Calculator Input */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-2xl"
          >
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Your Current Metrics</h3>
            
            <div className="space-y-8">
              {/* Monthly Visitors */}
              <div>
                <Label htmlFor="visitors" className="text-gray-900 font-semibold mb-3 block">
                  Monthly Website Visitors
                </Label>
                <div className="flex items-center gap-4 mb-3">
                  <Slider
                    id="visitors"
                    min={100}
                    max={100000}
                    step={100}
                    value={[monthlyVisitors]}
                    onValueChange={(value) => setMonthlyVisitors(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={monthlyVisitors}
                    onChange={(e) => setMonthlyVisitors(Number(e.target.value))}
                    className="w-32"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Not sure? Check your Google Analytics or estimate based on your industry.
                </p>
              </div>

              {/* Conversion Rate */}
              <div>
                <Label htmlFor="conversion" className="text-gray-900 font-semibold mb-3 block">
                  Current Conversion Rate (%)
                </Label>
                <div className="flex items-center gap-4 mb-3">
                  <Slider
                    id="conversion"
                    min={0.5}
                    max={10}
                    step={0.1}
                    value={[conversionRate]}
                    onValueChange={(value) => setConversionRate(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={conversionRate}
                    onChange={(e) => setConversionRate(Number(e.target.value))}
                    className="w-32"
                    step="0.1"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Industry average is 2-3%. This is the % of visitors who become leads/customers.
                </p>
              </div>

              {/* Average Order Value */}
              <div>
                <Label htmlFor="aov" className="text-gray-900 font-semibold mb-3 block">
                  Average Customer Value ($)
                </Label>
                <div className="flex items-center gap-4 mb-3">
                  <Slider
                    id="aov"
                    min={50}
                    max={5000}
                    step={10}
                    value={[averageOrderValue]}
                    onValueChange={(value) => setAverageOrderValue(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={averageOrderValue}
                    onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                    className="w-32"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Average revenue per customer or average order value.
                </p>
              </div>

              <Button 
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold py-6 text-lg btn-breathe btn-glow"
              >
                Calculate My Potential ROI
                <Calculator className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={`bg-gradient-to-br from-accent/10 to-secondary/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-accent/20 ${
              showResults ? "block" : "hidden lg:block"
            }`}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Your Projected Growth</h3>
            
            {showResults ? (
              <div className="space-y-6">
                {/* Current vs Projected */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-gray-300 text-sm mb-1">Current Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(currentRevenue)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-accent to-secondary rounded-xl p-4 shadow-lg">
                    <p className="text-charcoal text-sm mb-1 font-medium">Projected Monthly Revenue</p>
                    <p className="text-2xl font-bold text-charcoal">{formatCurrency(projectedRevenue)}</p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-accent rounded-full p-2">
                        <DollarSign className="h-5 w-5 text-charcoal" />
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Additional Monthly Revenue</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(additionalRevenue)}</p>
                      </div>
                    </div>
                    <p className="text-accent text-sm font-semibold">
                      That's {formatCurrency(yearlyAdditionalRevenue)} per year!
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-secondary rounded-full p-2">
                        <Users className="h-5 w-5 text-charcoal" />
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Additional Monthly Leads</p>
                        <p className="text-3xl font-bold text-white">{formatNumber(additionalLeads)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-accent rounded-full p-2">
                        <TrendingUp className="h-5 w-5 text-charcoal" />
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Projected Revenue Growth</p>
                        <p className="text-3xl font-bold text-white">
                          {((projectedRevenue / currentRevenue - 1) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    <span className="font-semibold text-accent">Note:</span> These projections are based on 
                    conservative industry benchmarks (30% traffic increase, 50% conversion rate improvement). 
                    Actual results may vary based on your industry, current performance, and engagement level.
                  </p>
                </div>

                {/* CTA */}
                <Link href="/contact">
                  <Button className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold py-6 text-lg shadow-xl btn-breathe btn-glow">
                    Let's Make This Happen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <Calculator className="h-16 w-16 text-accent mx-auto mb-4 opacity-50" />
                  <p className="text-gray-300 text-lg">
                    Enter your metrics to see your potential ROI
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Additional Trust Elements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h4 className="text-2xl font-bold text-white mb-4">Why Our Estimates Are Conservative</h4>
            <p className="text-gray-300 leading-relaxed mb-6">
              We've seen many clients exceed these projections significantly. Our calculator uses industry-standard 
              benchmarks and assumes you'll work with us consistently. Real results depend on your current situation, 
              industry, competition, and how actively we collaborate.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-accent mb-1">30%</p>
                <p className="text-gray-300 text-sm">Estimated Traffic Increase</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-secondary mb-1">50%</p>
                <p className="text-gray-300 text-sm">Conversion Rate Improvement</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent mb-1">6-12</p>
                <p className="text-gray-300 text-sm">Months to Full Results</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
};

export default ROICalculator;
