
"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Award } from "lucide-react";

const CaseStudiesHero = () => {
  const stats = [
    {
      icon: TrendingUp,
      number: "300%",
      label: "Average ROI Increase"
    },
    {
      icon: Users,
      number: "200+",
      label: "Successful Projects"
    },
    {
      icon: Award,
      number: "98%",
      label: "Client Satisfaction"
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-r from-primary to-primary/80 text-white">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Success <span className="text-yellow-300">Stories</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto">
            Real businesses, real results. See how our smart digital marketing 
            strategies have helped companies achieve remarkable growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="bg-white/10 p-4 rounded-full inline-block mb-4">
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="text-4xl font-bold text-yellow-300 mb-2">
                {stat.number}
              </div>
              <div className="text-primary-foreground/80">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesHero;
