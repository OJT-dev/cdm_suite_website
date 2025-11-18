
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden pt-20 md:pt-0">
      {/* Background Image - More Approachable */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="https://cdn.abacus.ai/images/e82e2d74-297b-40c9-838d-190a47e307dd.png"
            alt="Diverse team of Black professionals collaborating in modern office"
            fill
            className="object-cover brightness-95"
            priority
          />
          {/* Lighter overlay for more approachable feel */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-gray-900/40"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 section-container text-white">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-block bg-secondary/20 backdrop-blur-sm border border-secondary/30 rounded-full px-4 py-2 mb-3 md:mb-6"
            >
              <span className="text-secondary font-semibold text-sm md:text-base">🚀 Your Growth Partner</span>
            </motion.div>
            
            <motion.h1 
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Enterprise-Grade Digital Solutions
              <br />
              <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent">Backed by Infrastructure Expertise</span>
            </motion.h1>
            
            <motion.p 
              className="text-base md:text-xl mb-4 md:mb-8 text-gray-200 leading-relaxed hidden md:block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Our leadership team combines multi-billion dollar infrastructure program experience with proven sales and operations management expertise. This unique blend ensures every digital solution is delivered with rigorous planning, strategic financial oversight, and the same execution standards used in landmark public sector and enterprise projects.
            </motion.p>

            {/* Shortened version for mobile */}
            <motion.p 
              className="text-base mb-4 text-gray-200 leading-relaxed md:hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Multi-billion dollar infrastructure expertise meets proven sales and operations management. Enterprise-grade delivery standards for your digital solutions.
            </motion.p>

            {/* Trust Indicators - CRO Optimization */}
            <motion.div 
              className="flex flex-wrap gap-2 md:gap-4 mb-4 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-4 py-1.5 md:py-2">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                <span className="text-xs md:text-sm font-medium">$9B+ Infrastructure</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-4 py-1.5 md:py-2">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                <span className="text-xs md:text-sm font-medium">$2.4M+ Sales</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-4 py-1.5 md:py-2">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                <span className="text-xs md:text-sm font-medium">120%+ Growth</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold shadow-xl hover:shadow-2xl transition-all duration-300 group text-base md:text-lg px-6 md:px-8 py-5 md:py-6 btn-breathe btn-glow">
                  Get Your Free Strategy Call
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/services" className="w-full sm:w-auto hidden sm:block">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-secondary/50 text-white hover:bg-secondary hover:text-charcoal text-base md:text-lg px-6 md:px-8 py-5 md:py-6 font-semibold">
                  View Our Services
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.p
              className="mt-4 md:mt-6 text-xs md:text-sm text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              ⭐⭐⭐⭐⭐ Trusted by businesses across industries
            </motion.p>
          </motion.div>

          {/* Stats Card - CRO Element */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Work With CDM Suite</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏗️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Infrastructure-Grade Standards</h4>
                    <p className="text-gray-600 text-sm">Rigorous project controls from $9B+ infrastructure programs</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💼</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Sales & Financial Planning</h4>
                    <p className="text-gray-600 text-sm">Licensed financial expertise with $2.4M+ in documented results</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Operations Excellence</h4>
                    <p className="text-gray-600 text-sm">Proven 120%+ profit growth through strategic management</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Team Leadership</h4>
                    <p className="text-gray-600 text-sm">Experience managing 50+ person teams across sectors</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center font-medium">
                  🔒 Professional Service • Reliable Delivery
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
