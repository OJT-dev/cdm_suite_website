
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Search, Settings, BarChart3, TrendingUp } from "lucide-react";

const ProcessSection = () => {
  const steps = [
    {
      number: "01",
      title: "Discovery & Strategy",
      description: "We begin by understanding your business goals, target audience, and competitive landscape. Through detailed analysis and consultation, we create a custom digital marketing plan.",
      image: "https://cdn.abacus.ai/images/9df22544-e703-4ebc-bc82-dc1f7c981cb2.png",
      icon: Search,
      highlights: ["Business Analysis", "Competitor Research", "Goal Setting", "Plan Development"],
    },
    {
      number: "02",
      title: "Implementation",
      description: "Our expert team brings your plan to life with careful execution. We build, design, develop, and launch your digital marketing campaigns with attention to every detail.",
      image: "https://cdn.abacus.ai/images/5ef14ad7-9da8-4b73-9465-fc86cd14d901.png",
      icon: Settings,
      highlights: ["Campaign Setup", "Creative Development", "Technical Setup", "Quality Checks"],
    },
    {
      number: "03",
      title: "Analysis & Reporting",
      description: "We continuously monitor performance using powerful tracking tools. Regular reporting keeps you informed of progress, ROI, and key performance indicators across all channels.",
      image: "https://cdn.abacus.ai/images/3cec4c59-bcd5-4c35-9049-305d3d21700b.png",
      icon: BarChart3,
      highlights: ["Performance Monitoring", "Number Analysis", "ROI Tracking", "Regular Reporting"],
    },
    {
      number: "04",
      title: "Optimization",
      description: "Based on what the numbers tell us, we continuously improve campaigns for better performance. Testing, refinement, and smart adjustments ensure maximum results and ROI.",
      image: "https://cdn.abacus.ai/images/694f115c-6997-4b80-b2ec-6c3e1189115c.png",
      icon: TrendingUp,
      highlights: ["A/B Testing", "Performance Tuning", "Smart Adjustments", "Continuous Improvement"],
    },
  ];

  return (
    <section id="process" className="py-20 bg-gradient-to-b from-cool-gray to-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-secondary to-accent rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-gradient-to-br from-primary to-secondary rounded-full mix-blend-multiply filter blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Proven Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A simple path to digital marketing success. Our four step process ensures 
            consistent results and measurable growth for every client.
          </p>
        </motion.div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-12`}
            >
              {/* Content */}
              <div className="lg:w-1/2">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-accent to-secondary text-charcoal w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mr-4 shadow-lg float-animation">
                    {step.number}
                  </div>
                  <step.icon className="h-8 w-8 text-primary float-animation" />
                </div>
                
                <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {step.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {step.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      <span className="font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="lg:w-1/2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden shadow-lg"
                >
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16 p-8 bg-primary/5 rounded-lg"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to Start Your Digital Marketing Journey?
          </h3>
          <p className="text-gray-600 mb-6">
            Let's discuss how our proven process can help grow your business.
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal px-8 py-3 rounded-md font-bold transition-all shadow-lg hover:shadow-xl"
          >
            Start Your Project Today
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
