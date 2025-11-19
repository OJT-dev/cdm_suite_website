
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Quote, TrendingUp, Users, DollarSign } from "lucide-react";
import Link from "next/link";

const ClientSuccessStories = () => {
  const [activeStory, setActiveStory] = useState(0);

  const successStories = [
    {
      clientName: "Urban Pulse Fitness",
      industry: "Health & Fitness",
      challenge: "A local gym chain struggling with online visibility and lead generation in a competitive market.",
      solution: "Implemented a comprehensive SEO strategy, redesigned their website for better conversion, and launched targeted social media campaigns.",
      results: [
        { metric: "Website Traffic", value: "+285%", icon: TrendingUp },
        { metric: "Lead Generation", value: "+340%", icon: Users },
        { metric: "Revenue Growth", value: "+180%", icon: DollarSign },
      ],
      testimonial: "CDM Suite didn't just build us a website—they transformed how we connect with our community. Within 6 months, we saw a dramatic increase in membership inquiries, and our online booking system is now fully automated. They truly became an extension of our team.",
      clientRole: "Sarah Martinez, Owner",
      clientImage: "https://pbs.twimg.com/profile_images/1563452336646680577/NBNCIFMD_200x200.jpg",
      timeframe: "6 months",
      color: "from-blue-500 to-cyan-500",
    },
    {
      clientName: "Precision Home Services",
      industry: "Home Services",
      challenge: "A plumbing and HVAC company with excellent service but no digital presence, losing customers to competitors with better online visibility.",
      solution: "Created a mobile-first website, optimized Google My Business, launched local SEO campaigns, and implemented automated lead follow-up systems.",
      results: [
        { metric: "Local Search Rankings", value: "Top 3", icon: TrendingUp },
        { metric: "Monthly Leads", value: "+420%", icon: Users },
        { metric: "Cost Per Lead", value: "-65%", icon: DollarSign },
      ],
      testimonial: "Before CDM Suite, we relied entirely on word-of-mouth. Now, we're booked solid three weeks out. The best part? The phone rings automatically with qualified leads who already want to hire us. It's like having a 24/7 sales team.",
      clientRole: "Marcus Thompson, Founder",
      clientImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Nicholas_Marcus_Thompson.jpg/1200px-Nicholas_Marcus_Thompson.jpg",
      timeframe: "4 months",
      color: "from-orange-500 to-red-500",
    },
    {
      clientName: "Elevate Digital Boutique",
      industry: "E-commerce Fashion",
      challenge: "An online fashion boutique with great products but struggling with cart abandonment and low conversion rates.",
      solution: "Redesigned the entire user experience, implemented strategic A/B testing, created automated email sequences, and optimized the checkout process.",
      results: [
        { metric: "Conversion Rate", value: "+215%", icon: TrendingUp },
        { metric: "Cart Abandonment", value: "-58%", icon: Users },
        { metric: "Average Order Value", value: "+92%", icon: DollarSign },
      ],
      testimonial: "We were ready to shut down the store before working with CDM Suite. They analyzed every step of our customer journey and made data-driven changes that completely turned things around. Now we're profitable and scaling fast.",
      clientRole: "Jasmine Chen, Founder & Creative Director",
      clientImage: "https://miro.medium.com/v2/resize:fit:2000/1*Qd1PYvJHkpFUyGOnVh0wkQ.jpeg",
      timeframe: "5 months",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const story = successStories[activeStory];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary rounded-full filter blur-3xl"></div>
      </div>

      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-6 py-2 mb-6">
            <span className="text-primary font-semibold">💪 Real Results, Real Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Success Stories From Businesses Like Yours
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it—see how we've helped real businesses achieve 
            measurable growth and transform their digital presence.
          </p>
        </motion.div>

        {/* Story Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {successStories.map((s, index) => (
            <button
              key={index}
              onClick={() => setActiveStory(index)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeStory === index
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-100 shadow"
              }`}
            >
              {s.clientName}
            </button>
          ))}
        </div>

        {/* Active Story Card */}
        <motion.div
          key={activeStory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className={`bg-gradient-to-r ${story.color} p-8 text-white`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-3xl font-bold mb-2">{story.clientName}</h3>
                <p className="text-white/90 text-lg">{story.industry} • {story.timeframe} project</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={story.clientImage}
                    alt={story.clientRole}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {/* The Challenge */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">⚠️</span> The Challenge
              </h4>
              <p className="text-gray-700 leading-relaxed">{story.challenge}</p>
            </div>

            {/* Our Solution */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span> Our Solution
              </h4>
              <p className="text-gray-700 leading-relaxed">{story.solution}</p>
            </div>

            {/* Results Grid */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">🎯</span> The Results
              </h4>
              <div className="grid md:grid-cols-3 gap-6">
                {story.results.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-br ${story.color} p-6 rounded-xl text-white shadow-lg`}
                  >
                    <result.icon className="h-8 w-8 mb-3 opacity-90" />
                    <p className="text-sm font-medium opacity-90 mb-1">{result.metric}</p>
                    <p className="text-3xl font-bold">{result.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl relative">
              <Quote className="absolute top-4 left-4 h-12 w-12 text-gray-300" />
              <div className="relative z-10 pl-8">
                <p className="text-lg text-gray-800 leading-relaxed mb-4 italic">
                  "{story.testimonial}"
                </p>
                <p className="font-semibold text-gray-900">{story.clientRole}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Write Your Success Story?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can help your business achieve similar results with a 
            customized digital marketing strategy.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold shadow-xl hover:shadow-2xl transition-all group px-10 py-6 text-lg btn-breathe btn-glow">
              Schedule Your Free Strategy Call
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ClientSuccessStories;
