
"use client";

import { motion } from "framer-motion";
import { MessageCircle, Calendar, Phone } from "lucide-react";

const ContactHero = () => {
  const benefits = [
    {
      icon: MessageCircle,
      title: "Free Consultation",
      description: "Get expert advice tailored to your business needs"
    },
    {
      icon: Calendar,
      title: "Quick Response",
      description: "We'll get back to you within 24 hours"
    },
    {
      icon: Phone,
      title: "No Obligation",
      description: "No pressure, just honest recommendations"
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
            Let's <span className="text-yellow-300">Get Started</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto">
            Ready to grow your business with smart digital marketing? 
            Get your free consultation and custom strategy today.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="bg-white/10 p-4 rounded-full inline-block mb-4">
                <benefit.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-primary-foreground/80">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
