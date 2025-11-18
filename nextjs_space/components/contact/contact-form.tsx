

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, CheckCircle, Calendar } from "lucide-react";
import Script from "next/script";
import { trackRedditLead } from "@/lib/reddit-tracking";
import { trackConversion } from "@/lib/analytics";

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  formType: string;
  // Honeypot field - should remain empty
  website: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    formType: "get-started",
    website: "" // Honeypot
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formMountTime] = useState(Date.now()); // Track when form loads
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Anti-spam checks (client-side)
    const submissionTime = Date.now();
    const timeTaken = (submissionTime - formMountTime) / 1000; // in seconds
    
    // Check 1: Honeypot field should be empty
    if (formData.website) {
      console.warn('Spam detected: honeypot field filled');
      setIsSubmitting(false);
      return; // Silently reject
    }
    
    // Check 2: Form filled too quickly (< 3 seconds is suspicious)
    if (timeTaken < 3) {
      console.warn('Spam detected: form submitted too quickly');
      toast({
        title: "Please take a moment",
        description: "Please review your message before submitting.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          _submitTime: timeTaken // Send time taken for backend validation
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        
        // Track lead conversion - dual tracking (client-side + server-side)
        trackRedditLead(formData.email);
        trackConversion('contact_form_submission', undefined, 'USD', {
          email: formData.email,
          formType: formData.formType,
          company: formData.company,
        });
        
        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you within 24 hours.",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          message: "",
          formType: "get-started",
          website: "" // Reset honeypot
        });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-white">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-green-100 p-8 rounded-lg">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Thank You!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Your message has been sent successfully. Our team will review your inquiry 
                and get back to you within 24 hours with a customized strategy proposal.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="mr-4"
              >
                Send Another Message
              </Button>
              <Button asChild>
                <a href="/">Back to Home</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Get Your Free Consultation
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-2"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-2"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-2"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    className="mt-2"
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Tell Us About Your Project *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-2 min-h-[120px]"
                  placeholder="Describe your goals, challenges, and how we can help grow your business..."
                />
              </div>

              {/* Honeypot field - hidden from humans, visible to bots */}
              <div className="absolute opacity-0 pointer-events-none" style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <Label htmlFor="website">Website (leave blank)</Label>
                <Input
                  id="website"
                  name="website"
                  type="text"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary group"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                * Required fields. We respect your privacy and never share your information.
              </p>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                What Happens Next?
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Initial Review</h4>
                    <p className="text-gray-600 mt-1">
                      We'll review your submission and research your business and industry.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Strategy Call</h4>
                    <p className="text-gray-600 mt-1">
                      We'll schedule a consultation call to discuss your goals and challenges.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Custom Proposal</h4>
                    <p className="text-gray-600 mt-1">
                      You'll receive a tailored strategy and proposal within 48 hours.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-primary/10 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  🚀 Ready to get started immediately?
                </h4>
                <p className="text-gray-600 text-sm">
                  Most clients see initial results within 30 days of starting. 
                  Our average client achieves 150-300% ROI within 6-12 months.
                </p>
              </div>
            </div>

            {/* Calendly Booking Widget */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-semibold text-gray-900">
                  Book a Strategy Session
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Want to talk right now? Book a 30-minute digital marketing power session with our team.
              </p>
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/cdm-creativemedia/digital-marketing-power-session?hide_event_type_details=1&hide_gdpr_banner=1" 
                style={{minWidth: '320px', height: '700px'}}
              ></div>
              <Script
                src="https://assets.calendly.com/assets/external/widget.js"
                strategy="lazyOnload"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
