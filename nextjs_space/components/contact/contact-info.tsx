

"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const ContactInfo = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to us using any of the methods below.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-lg shadow-lg text-center card-hover"
          >
            <div className="bg-primary/10 p-4 rounded-full inline-block mb-6">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Our Locations
            </h3>
            <div className="space-y-2 text-gray-600">
              <p className="font-medium">USA</p>
              <p className="font-medium">Central America</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-lg shadow-lg text-center card-hover"
          >
            <div className="bg-primary/10 p-4 rounded-full inline-block mb-6">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Call Us Now
            </h3>
            <div className="space-y-2">
              <a 
                href="tel:8622727623" 
                className="block text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
              >
                (862) 272-7623
              </a>
              <p className="text-gray-600">Available 24/7</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-lg shadow-lg text-center card-hover"
          >
            <div className="bg-primary/10 p-4 rounded-full inline-block mb-6">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Email Us
            </h3>
            <div className="space-y-2 text-gray-600">
              <p>Quick Response</p>
              <p>Within 24 hours</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-lg shadow-lg text-center card-hover"
          >
            <div className="bg-primary/10 p-4 rounded-full inline-block mb-6">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Business Hours
            </h3>
            <div className="space-y-2 text-gray-600">
              <p>Mon-Fri: 9AM-6PM EST</p>
              <p>24/7 Support Available</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16 p-8 bg-white rounded-lg shadow-lg"
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Prefer to Email Directly?
          </h3>
          <p className="text-gray-600 mb-6">
            You can also reach out to us directly via email with any questions or to schedule a consultation.
          </p>
          <a
            href="mailto:hello@cdmsuite.com?subject=New Business Inquiry&body=Hi CDM Suite team,%0A%0AI'm interested in learning more about your digital marketing services.%0A%0ABusiness: [Your Business Name]%0AWebsite: [Your Website URL]%0AGoals: [Brief description of your marketing goals]%0A%0APlease contact me to schedule a consultation.%0A%0AThank you!"
            className="inline-block bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
          >
            Email Us Directly
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactInfo;
