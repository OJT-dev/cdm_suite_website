
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, TrendingUp, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaseStudyDetailProps {
  slug: string;
}

const CaseStudyDetail = ({ slug }: CaseStudyDetailProps) => {
  // In a real app, you'd fetch the case study data based on the slug
  const caseStudy = {
    title: "Business Success Story",
    client: "Sample Client",
    industry: "Business",
    challenge: "This case study demonstrates how our data-driven digital marketing strategies help businesses achieve remarkable growth.",
    solution: "We implemented a comprehensive digital marketing strategy tailored to the client's specific needs and goals.",
    results: {
      metric1: "+250%",
      metric2: "+180%", 
      metric3: "+95%"
    },
    timeline: "6 months",
    image: "https://cdn.abacus.ai/images/970b470b-5cce-4f06-8637-65ff8c5feaa1.png"
  };

  return (
    <article className="py-20">
      <div className="section-container">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link href="/case-studies">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Case Studies
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="mb-6">
            <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
              {caseStudy.industry}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 max-w-4xl mx-auto">
            {caseStudy.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            {caseStudy.client} • {caseStudy.timeline}
          </p>
        </motion.header>

        {/* Results Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto"
        >
          <div className="text-center p-6 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-2">
              {caseStudy.results.metric1}
            </div>
            <div className="text-gray-600">Growth Achieved</div>
          </div>
          <div className="text-center p-6 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-2">
              {caseStudy.results.metric2}
            </div>
            <div className="text-gray-600">Revenue Increase</div>
          </div>
          <div className="text-center p-6 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-2">
              {caseStudy.results.metric3}
            </div>
            <div className="text-gray-600">ROI Improvement</div>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-12 max-w-4xl mx-auto"
        >
          <Image
            src={caseStudy.image}
            alt={caseStudy.title}
            fill
            className="object-cover"
          />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="mr-2 h-6 w-6 text-primary" />
                Challenge
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {caseStudy.challenge}
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 h-6 w-6 text-primary" />
                Solution
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {caseStudy.solution}
              </p>
            </div>
          </div>

          <div className="bg-primary text-white p-8 rounded-lg mt-12 text-center">
            <h3 className="text-2xl font-semibold mb-4">
              Ready for Similar Results?
            </h3>
            <p className="text-primary-foreground/90 mb-6">
              Let our team help your business achieve remarkable growth with data-driven 
              digital marketing strategies.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Start Your Success Story
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* More Case Studies CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16"
        >
          <Link href="/case-studies">
            <Button size="lg" variant="outline">
              View More Case Studies
            </Button>
          </Link>
        </motion.div>
      </div>
    </article>
  );
};

export default CaseStudyDetail;
