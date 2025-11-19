
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPostDetailProps {
  slug: string;
}

const BlogPostDetail = ({ slug }: BlogPostDetailProps) => {
  // In a real app, you'd fetch the blog post data based on the slug
  const blogPost = {
    title: "Digital Marketing Insights",
    content: "This is a sample blog post. In a production environment, you would fetch the actual content from your CMS or database based on the slug parameter.",
    image: "https://cdn.abacus.ai/images/970b470b-5cce-4f06-8637-65ff8c5feaa1.png",
    category: "Digital Marketing",
    date: "2024-10-01",
    readTime: "5 min read",
    author: "CDM Suite Team"
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    });
  };

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: blogPost.title,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
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
          <Link href="/blog">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
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
            <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {blogPost.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 max-w-4xl mx-auto">
            {blogPost.title}
          </h1>
          
          <div className="flex items-center justify-center gap-6 text-gray-700 mb-8">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-gray-700" />
              <span className="text-gray-700">{formatDate(blogPost.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4 text-gray-700" />
              <span className="text-gray-700">{blogPost.readTime}</span>
            </div>
            <div className="text-sm text-gray-700">
              By {blogPost.author}
            </div>
          </div>

          <Button onClick={sharePost} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 group">
            <Share2 className="mr-2 h-4 w-4" />
            Share Article
          </Button>
        </motion.header>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-12 max-w-4xl mx-auto"
        >
          <Image
            src={blogPost.image}
            alt={blogPost.title}
            fill
            className="object-cover"
          />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-800 leading-relaxed mb-8">
              {blogPost.content}
            </p>
            
            <div className="bg-primary/5 p-8 rounded-lg border border-primary/10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Implement These Strategies?
              </h2>
              <p className="text-gray-800 mb-6">
                Our team at CDM Suite can help you implement these digital marketing strategies 
                and achieve measurable results for your business.
              </p>
              <Link href="/contact">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Get Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Related Posts CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Link href="/blog">
            <Button size="lg" variant="outline">
              Read More Articles
            </Button>
          </Link>
        </motion.div>
      </div>
    </article>
  );
};

export default BlogPostDetail;
