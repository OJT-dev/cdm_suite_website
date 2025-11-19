
"use client";

import { motion } from "framer-motion";
import { Target, Eye, Heart, Zap } from "lucide-react";

const AboutMission = () => {
  const values = [
    {
      icon: Target,
      title: "Infrastructure-Grade Planning",
      description: "Critical Path Method (CPM) scheduling and project controls from $9.3B+ programs ensure systematic delivery.",
    },
    {
      icon: Eye,
      title: "Sales & Financial Expertise",
      description: "OLT & Equity Licensed professionals with $2.4M+ in sales and proven wealth management solutions.",
    },
    {
      icon: Heart,
      title: "Operations Excellence",
      description: "Experience managing 50+ person teams with 120%+ profit growth through strategic process optimization.",
    },
    {
      icon: Zap,
      title: "Technical Certifications",
      description: "BIM certified, Oracle Primavera expertise, combined with React, Next.js, TypeScript, and AWS infrastructure.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Our Mission & Values
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            To deliver enterprise-grade digital solutions with infrastructure-level planning, strategic 
            financial oversight, and operations excellence—combining technical rigor with proven business 
            development expertise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg shadow-lg text-center card-hover"
            >
              <div className="bg-primary/10 p-4 rounded-full inline-block mb-6">
                <value.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {value.title}
              </h3>
              <p className="text-gray-600">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-primary text-white rounded-lg p-12 text-center"
        >
          <h3 className="text-3xl font-bold mb-6">
            Ready for Professional Digital Solutions?
          </h3>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Experience the difference that infrastructure-grade project management brings to digital delivery.
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-white text-primary px-8 py-4 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Your Success Story
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutMission;
