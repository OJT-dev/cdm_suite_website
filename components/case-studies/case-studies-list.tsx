"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  category: string;
  client: string;
  description: string;
  challenge?: string | null;
  solution?: string | null;
  results?: any;
  testimonialQuote?: string | null;
  testimonialAuthor?: string | null;
  testimonialCompany?: string | null;
  heroImage: string;
  tags: any;
}

interface CaseStudiesListProps {
  studies: CaseStudy[];
}

const CaseStudiesList = ({ studies }: CaseStudiesListProps) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(studies.map(study => study.category)))];

  const filteredCaseStudies = selectedCategory === "All" 
    ? studies 
    : studies.filter(study => study.category === selectedCategory);

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="section-container">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-4 justify-center mb-16"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === selectedCategory ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`${
                category === selectedCategory 
                  ? "bg-primary text-white hover:bg-primary/90" 
                  : "border-gray-300 hover:border-primary hover:text-primary"
              }`}
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCaseStudies.map((study, index) => {
            const results = Array.isArray(study.results) ? study.results : [];
            const tags = Array.isArray(study.tags) ? study.tags : [];
            
            return (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden card-hover group"
            >
              <div className="relative h-64 bg-gray-100 dark:bg-gray-700">
                <Image
                  src={study.heroImage.startsWith('uploads/') ? `/api/file/${encodeURIComponent(study.heroImage)}` : study.heroImage}
                  alt={study.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {study.category}
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {study.title}
                </h3>
                <p className="text-primary font-medium mb-4">{study.client}</p>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">{study.description}</p>

                {study.challenge && (
                  <div className="space-y-2 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Challenge:</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{study.challenge}</p>
                    </div>
                  </div>
                )}

                {results && results.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Results:</h4>
                    <ul className="space-y-1">
                      {results.map((result: any, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {study.testimonialQuote && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <Quote className="h-6 w-6 text-primary mb-2" />
                    <p className="text-sm text-gray-800 dark:text-gray-300 italic line-clamp-3">
                      "{study.testimonialQuote.substring(0, 150)}..."
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-400 mt-2">
                      — {study.testimonialAuthor}, {study.testimonialCompany}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag: any, idx: number) => (
                    <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Link href={`/case-studies/${study.slug}`}>
                  <Button className="w-full group">
                    View Full Case Study
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )})}
        </div>

        {filteredCaseStudies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No case studies found in this category.</p>
          </div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 bg-primary/5 dark:bg-primary/10 p-12 rounded-lg text-center"
        >
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Write Your Success Story?
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the businesses that have achieved remarkable growth with our 
            data-driven digital marketing strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="btn-primary">
                Start Your Success Story
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Our Packages
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CaseStudiesList;
