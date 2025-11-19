
"use client";

import { motion } from "framer-motion";

const AboutTeam = () => {
  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Leadership & Expertise
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our leadership team combines proven experience from $9.3B+ infrastructure programs with 
            sales excellence, financial planning, and operations management expertise delivering 120%+ 
            profit growth across multiple sectors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-primary/10 p-8 rounded-lg mb-6">
              <h3 className="text-6xl font-bold text-primary mb-2">$9.3B+</h3>
              <p className="text-gray-600">Infrastructure Programs</p>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              Complex Project Experience
            </h4>
            <p className="text-gray-600">
              LaGuardia Terminal B, JFK Terminal 6, and DASNY public sector projects.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-primary/10 p-8 rounded-lg mb-6">
              <h3 className="text-6xl font-bold text-primary mb-2">$250M+</h3>
              <p className="text-gray-600">Operations Assets</p>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              Operational Excellence
            </h4>
            <p className="text-gray-600">
              Logistics operations management with proven 120%+ profit growth achievement.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-primary/10 p-8 rounded-lg mb-6">
              <h3 className="text-6xl font-bold text-primary mb-2">$2.4M+</h3>
              <p className="text-gray-600">Sales Achieved</p>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              Sales & Financial Planning
            </h4>
            <p className="text-gray-600">
              OLT & Equity Licensed expertise across finance, logistics, and marketing sectors.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-lg p-12 text-center"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Leadership Expertise
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our leadership brings diverse, complementary expertise spanning infrastructure management, 
            operations excellence, financial planning, and technical project controls.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900">Infrastructure PM</h4>
              <p className="text-sm text-gray-600">$9.3B+ programs, CPM scheduling, BIM certified</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900">Operations Management</h4>
              <p className="text-sm text-gray-600">50+ team leadership, 120%+ profit growth</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900">Sales & Financial Planning</h4>
              <p className="text-sm text-gray-600">OLT & Equity Licensed, $2.4M+ in sales</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900">Technical Development</h4>
              <p className="text-sm text-gray-600">React, Next.js, TypeScript, AWS cloud</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutTeam;
