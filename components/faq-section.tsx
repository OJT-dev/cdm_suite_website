
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQSection = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqCategories = [
    {
      title: "About Working With Us",
      faqs: [
        {
          id: "work-1",
          question: "How do we get started working together?",
          answer: "Getting started is simple! Contact us for a free consultation where we'll discuss your goals, current challenges, and how our services can help. We'll then provide a customized proposal outlining our recommended strategy and timeline."
        },
        {
          id: "work-2",
          question: "What's your typical project timeline?",
          answer: "Project timelines vary based on scope and complexity. Website projects typically take 4-8 weeks, while comprehensive digital marketing campaigns can be launched within 2-4 weeks. We'll provide a detailed timeline during our initial consultation."
        },
        {
          id: "work-3",
          question: "Do you work with businesses in my industry?",
          answer: "We work with businesses across various industries including healthcare, technology, retail, professional services, and more. Our approach adapts to any industry's unique requirements and challenges."
        },
        {
          id: "work-4",
          question: "What level of involvement do you expect from us?",
          answer: "We handle the heavy lifting, but we value your input. Expect weekly check-ins, monthly strategy reviews, and collaboration on major decisions. Your industry expertise combined with our marketing knowledge creates the best results."
        },
        {
          id: "work-5",
          question: "How do you measure and report success?",
          answer: "We use powerful tracking tools to monitor KPIs relevant to your goals - whether that's website traffic, lead generation, sales conversions, or brand awareness. You'll receive detailed monthly reports with actionable insights."
        }
      ]
    },
    {
      title: "Services & Process",
      faqs: [
        {
          id: "service-1",
          question: "What digital marketing services do you offer?",
          answer: "We offer complete digital marketing services including responsive web design, digital advertising campaigns (PPC, social media), mobile app development, AI implementation, SEO, content marketing, and marketing automation."
        },
        {
          id: "service-2",
          question: "Can you help with both website design and digital marketing?",
          answer: "Absolutely! We can handle everything from website design and development to complete digital marketing campaigns. This integrated approach ensures consistency and better results."
        },
        {
          id: "service-3",
          question: "Do you provide ongoing support after project completion?",
          answer: "Yes, we offer ongoing support and maintenance for all our services. This includes regular updates, performance monitoring, troubleshooting, and smart improvements to ensure continued success."
        },
        {
          id: "service-4",
          question: "What makes your approach different from other agencies?",
          answer: "Our approach is numbers driven, not guesswork. We focus on measurable results, transparent reporting, and month to month contracts with no long term lock ins. Our team combines creative expertise with careful analysis."
        },
        {
          id: "service-5",
          question: "Do you handle both B2B and B2C marketing?",
          answer: "Yes, we have extensive experience with both B2B and B2C marketing strategies. Our approach adapts to your specific audience, sales cycle, and business model to deliver optimal results."
        },
        {
          id: "service-6",
          question: "Can you integrate AI into our existing business processes?",
          answer: "Yes, our AI implementation services help businesses automate processes, improve decision-making, and enhance customer experiences. We assess your current operations and recommend custom AI solutions that fit your needs."
        }
      ]
    },
    {
      title: "Investment & Contracts",
      faqs: [
        {
          id: "investment-1",
          question: "What's your pricing structure?",
          answer: "Our pricing varies based on services and scope. Web design projects typically start at $5,000, while ongoing digital marketing services start at $2,000/month. We provide custom quotes after understanding your specific needs and goals."
        },
        {
          id: "investment-2",
          question: "Do you require long term contracts?",
          answer: "No, we offer month to month contracts for our services. We believe in earning your business every month through results, not locking you into long term agreements you might not need."
        },
        {
          id: "investment-3",
          question: "What's included in your monthly retainer?",
          answer: "Monthly retainers typically include strategy development, campaign management, content creation, performance monitoring, monthly reporting, and ongoing improvements. Specific inclusions depend on your chosen service package."
        },
        {
          id: "investment-4",
          question: "Are there any setup fees or hidden costs?",
          answer: "We're transparent about all costs upfront. Some services may include one time setup fees (clearly outlined in proposals), but there are no hidden costs. All ongoing expenses are discussed and approved before implementation."
        },
        {
          id: "investment-5",
          question: "What kind of ROI can I expect?",
          answer: "While results vary by industry and goals, our clients typically see 150-300% ROI within 6-12 months. We focus on measurable outcomes and provide detailed tracking to demonstrate value and return on investment."
        },
        {
          id: "investment-6",
          question: "Do you offer guarantees on your work?",
          answer: "We guarantee the quality of our work and stand behind our deliverables. While we can't guarantee specific results (as marketing involves many variables), we do guarantee our commitment to achieving your goals through smart strategies."
        }
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-cool-gray to-secondary/5 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-10 w-80 h-80 bg-gradient-to-br from-secondary to-accent rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-gradient-to-br from-primary to-secondary rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
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
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get answers to common questions about our digital marketing services, 
            process, and partnership approach.
          </p>
        </motion.div>

        <div className="space-y-12">
          {faqCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                {category.title}
              </h3>
              
              <div className="space-y-4">
                {category.faqs.map((faq, faqIndex) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(faq.id)}
                      className="w-full text-left p-6 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                      aria-expanded={openItems[faq.id]}
                      aria-controls={`faq-answer-${faq.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900 pr-4">
                          {faq.question}
                        </h4>
                        {openItems[faq.id] ? (
                          <Minus className="h-5 w-5 text-primary flex-shrink-0" />
                        ) : (
                          <Plus className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </button>
                    
                    <motion.div
                      id={`faq-answer-${faq.id}`}
                      initial={false}
                      animate={{
                        height: openItems[faq.id] ? "auto" : 0,
                        opacity: openItems[faq.id] ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Still Have Questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? We're here to help with personalized answers.
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal px-10 py-4 rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all btn-breathe btn-glow text-lg"
          >
            Contact Us Today
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
