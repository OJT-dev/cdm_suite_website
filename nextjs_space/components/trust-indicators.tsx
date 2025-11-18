
"use client";

import { motion } from "framer-motion";
import { Award, Users, TrendingUp, Clock, Shield, Zap } from "lucide-react";

const TrustIndicators = () => {
  const indicators = [
    {
      icon: Users,
      metric: "50+",
      label: "Active Clients",
      description: "Businesses we currently serve",
    },
    {
      icon: TrendingUp,
      metric: "2-5x",
      label: "Growth Potential",
      description: "Expected revenue increase",
    },
    {
      icon: Clock,
      metric: "15+ Years",
      label: "Combined Experience",
      description: "Team expertise in marketing",
    },
    {
      icon: Award,
      metric: "90%",
      label: "Client Satisfaction",
      description: "Happy with our services",
    },
    {
      icon: Shield,
      metric: "100%",
      label: "Full Transparency",
      description: "Clear reporting & pricing",
    },
    {
      icon: Zap,
      metric: "24-48hr",
      label: "Typical Response",
      description: "We reply within 2 business days",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trusted by Growing Businesses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Numbers that demonstrate our commitment to delivering real, measurable results 
            for every client we partner with.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {indicators.map((indicator, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="bg-gradient-to-br from-accent/10 to-secondary/10 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                <indicator.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary mb-1">{indicator.metric}</p>
                <p className="font-semibold text-gray-900 mb-1">{indicator.label}</p>
                <p className="text-sm text-gray-500">{indicator.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Trust Elements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-gray-900 mb-2">No Long-Term Contracts</h3>
              <p className="text-gray-600 text-sm">
                We earn your business every month. Cancel anytime with 30 days notice.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Full Transparency</h3>
              <p className="text-gray-600 text-sm">
                Real-time dashboards showing exactly where your money goes and what it generates.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Results-Focused</h3>
              <p className="text-gray-600 text-sm">
                We optimize for revenue and conversions, not vanity metrics that don't matter.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustIndicators;
