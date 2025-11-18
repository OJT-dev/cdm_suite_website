
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap } from "lucide-react";

const MiniOffer = () => {
  return (
    <section className="relative py-8 md:py-12 lg:py-16 bg-gradient-to-br from-charcoal via-gray-900 to-charcoal overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-accent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 section-container">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-3 md:mb-4">
              <Zap className="h-3 w-3 md:h-4 md:w-4 text-accent" />
              <span className="text-accent font-bold text-xs md:text-sm uppercase tracking-wider">Limited Time Offer</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 md:mb-3 px-4">
              Get Everything You Need to
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent">
                Dominate Your Market
              </span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base lg:text-lg xl:text-xl max-w-3xl mx-auto px-4">
              The exact system we used to manage $9B+ in infrastructure programs and achieve 120%+ profit growth - now available for your business.
            </p>
          </motion.div>

          {/* Offer Box */}
          <motion.div 
            className="bg-white/5 backdrop-blur-lg border-2 border-accent/30 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-10 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* What You Get */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
                  <span className="bg-accent/20 p-1.5 md:p-2 rounded-lg text-lg md:text-xl">📦</span>
                  What You Get:
                </h3>
                <div className="space-y-3 md:space-y-4">
                  {[
                    { item: "Complete Marketing Strategy Session", value: "$2,500" },
                    { item: "Custom Growth Plan & Roadmap", value: "$1,500" },
                    { item: "Competitive Market Analysis", value: "$1,000" },
                    { item: "Lead Generation Framework", value: "$2,000" },
                    { item: "Sales Process Optimization", value: "$1,500" },
                    { item: "30-Day Action Plan", value: "$500" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-2 md:gap-3 bg-white/5 rounded-lg p-2.5 md:p-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 bg-accent rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 md:h-4 md:w-4 text-charcoal" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm md:text-base">{item.item}</p>
                        <p className="text-gray-400 text-xs md:text-sm">(Value: {item.value})</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Value Stack */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
                    <span className="bg-accent/20 p-1.5 md:p-2 rounded-lg text-lg md:text-xl">💰</span>
                    The Math:
                  </h3>
                  
                  <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                    <div className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm md:text-base">Total Value:</span>
                        <span className="text-white font-bold text-xl md:text-2xl line-through decoration-red-500">$9,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-accent font-bold text-base md:text-lg">Your Investment:</span>
                        <span className="text-accent font-bold text-3xl md:text-4xl">$0</span>
                      </div>
                    </div>

                    <div className="bg-accent/10 border-2 border-accent rounded-lg p-3 md:p-4">
                      <p className="text-white font-bold text-lg md:text-xl mb-2">You Save: $9,000</p>
                      <p className="text-gray-300 text-xs md:text-sm">
                        That's right - EVERYTHING is 100% FREE for qualified businesses. No credit card required.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-3 md:space-y-4">
                  <Link href="/contact" className="block">
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold text-base md:text-lg py-6 md:py-7 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                      <span className="block md:inline">Claim Your Free Strategy Session Now</span>
                      <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform inline-block" />
                    </Button>
                  </Link>
                  <p className="text-center text-gray-400 text-xs md:text-sm">
                    ⏰ Only 5 spots available this month • No strings attached
                  </p>
                </div>
              </div>
            </div>

            {/* Social Proof Footer */}
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 lg:gap-8 text-xs md:text-sm text-gray-300">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-accent flex-shrink-0" />
                  <span>$9B+ Projects Managed</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-accent flex-shrink-0" />
                  <span>120%+ Proven Growth</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-accent flex-shrink-0" />
                  <span>$2.4M+ in Sales</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Urgency Footer */}
          <motion.div
            className="text-center mt-4 md:mt-6 px-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-gray-400 text-xs md:text-sm lg:text-base">
              <span className="text-accent font-bold">WARNING:</span> We can only take on 5 new strategy sessions per month to ensure quality. 
              <br className="hidden sm:block" />
              Spots fill up fast. Apply now to secure your session before they're gone.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MiniOffer;
