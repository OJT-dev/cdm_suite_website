
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const AboutHero = () => {
  return (
    <section className="relative py-32 bg-gradient-to-r from-primary to-primary/80 text-white overflow-hidden">
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About <span className="text-yellow-300">CDM Suite</span>
            </h1>
            <p className="text-xl leading-relaxed mb-8">
              Founded in 2020, CDM Suite brings proven expertise from complex, multi-billion dollar 
              infrastructure programs to deliver enterprise-grade digital solutions. Our leadership has 
              navigated high-stakes environments in landmark aviation, logistics, and public sector projects.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-yellow-300">$9.3B+</div>
                <div className="text-white">Infrastructure Program Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300">$250M+</div>
                <div className="text-white">Operations Assets Managed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300">50+</div>
                <div className="text-white">Team Leadership Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300">120%+</div>
                <div className="text-white">Profit Growth Achieved</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-video bg-white/10 rounded-lg overflow-hidden"
          >
            <Image
              src="https://cdn.abacus.ai/images/b6f36bdd-b3a3-496a-9b8a-513d94cb4816.png"
              alt="CDM Suite Team"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default AboutHero;
