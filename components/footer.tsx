"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number>(2025);
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-charcoal text-white py-12">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-secondary to-accent text-charcoal px-3 py-1 rounded font-bold text-lg">
                CDM
              </div>
              <span className="font-semibold text-xl">Suite</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Digital marketing agency delivering real results. 
              We help businesses grow through smart web design, digital advertising, 
              mobile app development, and AI implementation services.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="tel:8622727623" 
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="bg-secondary/20 p-2 rounded group-hover:bg-secondary/30 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Call us now</div>
                  <div className="font-bold text-lg">(862) 272-7623</div>
                </div>
              </a>
              
              <a 
                href="mailto:hello@cdmsuite.com" 
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="bg-secondary/20 p-2 rounded group-hover:bg-secondary/30 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Email us</div>
                  <div className="font-semibold">hello@cdmsuite.com</div>
                </div>
              </a>
              
              <div className="flex items-center gap-3 text-gray-300">
                <div className="bg-secondary/20 p-2 rounded">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Serving</div>
                  <div className="font-semibold">USA & Central America</div>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/#services" className="hover:text-white transition-colors">Responsive Web Design</Link></li>
              <li><Link href="/#services" className="hover:text-white transition-colors">Digital Advertising</Link></li>
              <li><Link href="/#services" className="hover:text-white transition-colors">Mobile App Development</Link></li>
              <li><Link href="/#services" className="hover:text-white transition-colors">AI Implementation</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/about" className="hover:text-white transition-colors">About CDM Suite</Link></li>
              <li><Link href="/tools" className="hover:text-white transition-colors">Free Tools</Link></li>
              <li><Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {currentYear} CDM Suite. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
