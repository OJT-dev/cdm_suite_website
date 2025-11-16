
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const BlogList = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visiblePosts, setVisiblePosts] = useState(6);

  // Sample blog posts - in a real app, this would come from a database or CMS
  const blogPosts = [
    {
      id: "1",
      title: "10 Essential SEO Strategies for 2024",
      excerpt: "Discover the latest SEO techniques that will help your website rank higher in search results and drive more organic traffic.",
      image: "https://cdn.abacus.ai/images/970b470b-5cce-4f06-8637-65ff8c5feaa1.png",
      category: "SEO",
      date: "2024-10-05",
      readTime: "8 min read",
      slug: "essential-seo-strategies-2024"
    },
    {
      id: "2", 
      title: "How to Maximize ROI from PPC Advertising",
      excerpt: "Learn proven techniques to optimize your pay-per-click campaigns and achieve better returns on your advertising investment.",
      image: "https://cdn.abacus.ai/images/970b470b-5cce-4f06-8637-65ff8c5feaa1.png",
      category: "PPC",
      date: "2024-10-03",
      readTime: "6 min read",
      slug: "maximize-roi-ppc-advertising"
    },
    {
      id: "3",
      title: "The Future of AI in Digital Marketing",
      excerpt: "Explore how artificial intelligence is changing digital marketing and what it means for your business strategy.",
      image: "https://cdn.abacus.ai/images/970b470b-5cce-4f06-8637-65ff8c5feaa1.png",
      category: "AI",
      date: "2024-10-01",
      readTime: "10 min read",
      slug: "future-ai-digital-marketing"
    },
    {
      id: "4",
      title: "Mobile-First Design: Best Practices for 2024",
      excerpt: "Essential guidelines for creating responsive, user-friendly websites that perform excellently on mobile devices.",
      image: "https://cdn.abacus.ai/images/970b470b-5cce-4f06-8637-65ff8c5feaa1.png",
      category: "Web Design",
      date: "2024-09-28",
      readTime: "7 min read",
      slug: "mobile-first-design-best-practices"
    },
    {
      id: "5",
      title: "Social Media Marketing Trends to Watch",
      excerpt: "Stay ahead of the curve with the latest social media marketing trends that are driving engagement and conversions.",
      image: "https://cdn.abacus.ai/images/970b470b-5cce-4f06-8637-65ff8c5feaa1.png",
      category: "Social Media",
      date: "2024-09-25",
      readTime: "5 min read",
      slug: "social-media-marketing-trends-2024"
    },
    {
      id: "6",
      title: "Conversion Rate Optimization: A Complete Guide",
      excerpt: "Learn how to optimize your website for better conversions with proven CRO strategies and techniques.",
      image: "https://cdn.abacus.ai/images/970b470b-5cce-4f06-8637-65ff8c5feaa1.png",
      category: "CRO",
      date: "2024-09-22",
      readTime: "12 min read",
      slug: "conversion-rate-optimization-guide"
    }
  ];

  const categories = ["All", "SEO", "PPC", "AI", "Web Design", "Social Media", "CRO"];

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const displayedPosts = filteredPosts.slice(0, visiblePosts);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const loadMorePosts = () => {
    setVisiblePosts(prev => prev + 6);
  };

  return (
    <section className="py-20 bg-white">
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
              onClick={() => {
                setSelectedCategory(category);
                setVisiblePosts(6);
              }}
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

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg overflow-hidden card-hover group"
            >
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <Link href={`/blog/${post.slug}`}>
                  <Button variant="ghost" className="group/btn p-0 h-auto text-primary hover:text-primary/80">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Load More Button */}
        {filteredPosts.length > visiblePosts && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button 
              size="lg" 
              variant="outline" 
              className="group"
              onClick={loadMorePosts}
            >
              Load More Articles
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 bg-primary/5 p-12 rounded-lg text-center"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Updated with Our Latest Insights
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get the latest digital marketing tips, strategies, and case studies delivered 
            directly to your inbox.
          </p>
          <Link href="/contact">
            <Button size="lg" className="btn-primary">
              Subscribe to Our Newsletter
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogList;
