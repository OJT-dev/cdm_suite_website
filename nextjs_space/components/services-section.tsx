
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Monitor, Megaphone, Smartphone, Brain } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: Monitor,
      title: "Website Creation & Maintenance",
      description: "Custom sites that turn visitors into customers. Built mobile first with smooth user experience and layouts designed to convert.",
      image: "https://cdn.abacus.ai/images/be17cb63-d612-45d4-a305-c4454951de60.png",
      features: ["Mobile First Design", "SEO Optimized", "Fast Loading", "Built to Convert"],
      link: "/services/website-creation-starter",
    },
    {
      icon: Megaphone,
      title: "SEO & Digital Marketing",
      description: "Rank higher in search results and grow your social presence. Professional SEO services and social media management that delivers results.",
      image: "https://cdn.abacus.ai/images/c0201920-f2b3-4da8-b5e5-08cf4c08e5b5.png",
      features: ["Local SEO", "Social Media", "Content Marketing", "Performance Tracking"],
      link: "/services/seo-local-basic",
    },
    {
      icon: Smartphone,
      title: "Mobile App Development",
      description: "Bringing your big app idea to life. Native and multi platform mobile applications that engage users and drive business growth.",
      image: "https://cdn.abacus.ai/images/9f04f5ba-a634-414a-8344-b68ce3c2adf0.png",
      features: ["iOS & Android", "Multi Platform", "UX/UI Design", "App Store Ready"],
      link: "/services/app-creation-mvp",
    },
    {
      icon: Brain,
      title: "Ad Management & Growth",
      description: "Smart ads for measurable growth. Targeted PPC campaigns, social media advertising, and conversion tuning that delivers real ROI.",
      image: "https://cdn.abacus.ai/images/ced69fa8-5742-4173-aafb-2e0f52e13d6a.png",
      features: ["PPC Management", "Social Media Ads", "Display Advertising", "ROI Tracking"],
      link: "/services/ad-management-starter",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-cool-gray via-secondary/5 to-accent/5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
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
            Our Digital Marketing Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Numbers, not guesswork. We deliver measurable results through smart digital marketing 
            services designed to grow your business and maximize your return.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-lg shadow-lg overflow-hidden card-hover group"
            >
              <div className="relative h-64 bg-gray-100">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-500">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <Link href={service.link}>
                  <Button className="w-full group bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold shadow-lg hover:shadow-xl transition-all btn-breathe">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12 space-y-4"
        >
          <Link href="/services">
            <Button size="lg" variant="outline" className="mr-4 px-10 py-6 text-lg">
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" className="bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold shadow-xl hover:shadow-2xl transition-all group px-10 py-6 text-lg btn-breathe btn-glow">
              Get Custom Quote
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
