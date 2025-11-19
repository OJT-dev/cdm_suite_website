
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Monitor, Search, Megaphone, Smartphone, Package, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import Link from 'next/link';
import { ServiceModal } from '@/components/service-modal';
import { getTierById } from '@/lib/pricing-tiers';

interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  category?: string;
  priceRange?: string;
  features?: string[];
  popular?: boolean;
}

// Service category icons and descriptions
const categoryInfo: Record<string, { icon: any, title: string, description: string, detailPageSlug: string }> = {
  'website-creation': {
    icon: Monitor,
    title: 'Website Design & Development',
    description: 'Custom, responsive websites built to convert visitors into customers',
    detailPageSlug: 'web-design'
  },
  'website-maintenance': {
    icon: RefreshCw,
    title: 'Website Maintenance',
    description: 'Keep your site secure, updated, and running smoothly',
    detailPageSlug: 'web-design'
  },
  'seo': {
    icon: Search,
    title: 'Search Engine Optimization',
    description: 'Get found by customers searching for your services',
    detailPageSlug: 'seo'
  },
  'social-media': {
    icon: Megaphone,
    title: 'Social Media Management',
    description: 'Build your brand and engage your audience',
    detailPageSlug: 'social-media'
  },
  'ad-management': {
    icon: Megaphone,
    title: 'Digital Advertising',
    description: 'Targeted ad campaigns that deliver measurable ROI',
    detailPageSlug: 'ad-management'
  },
  'app-creation': {
    icon: Smartphone,
    title: 'Mobile App Development',
    description: 'Native and cross-platform apps for iOS and Android',
    detailPageSlug: 'app-development'
  },
  'app-maintenance': {
    icon: RefreshCw,
    title: 'App Maintenance & Support',
    description: 'Keep your mobile app updated and bug-free',
    detailPageSlug: 'app-development'
  },
  'bundle': {
    icon: Package,
    title: 'Service Bundles',
    description: 'Complete digital marketing packages at bundled pricing',
    detailPageSlug: 'pricing'
  },
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDetailPageSlug, setCurrentDetailPageSlug] = useState<string>('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      
      // Enrich services with pricing tier data
      const enrichedServices = data.map((service: Service) => {
        const tier = getTierById(service.slug);
        if (tier) {
          return {
            ...service,
            priceRange: tier.priceRange,
            features: tier.features,
            popular: tier.popular,
          };
        }
        return service;
      });
      
      setServices(enrichedServices);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setPageLoading(false);
    }
  };

  const categorizeServices = () => {
    const categories: Record<string, Service[]> = {
      'website-creation': [],
      'website-maintenance': [],
      'seo': [],
      'social-media': [],
      'ad-management': [],
      'app-creation': [],
      'app-maintenance': [],
      'bundle': [],
    };

    services.forEach(service => {
      // Check more specific patterns first to avoid miscategorization
      if (service.slug.startsWith('website-creation')) {
        categories['website-creation'].push(service);
      } else if (service.slug.startsWith('website-maintenance')) {
        categories['website-maintenance'].push(service);
      } else if (service.slug.startsWith('app-maintenance')) {
        categories['app-maintenance'].push(service);
      } else if (service.slug.startsWith('app-')) {
        categories['app-creation'].push(service);
      } else if (service.slug.startsWith('seo-')) {
        categories['seo'].push(service);
      } else if (service.slug.startsWith('social-')) {
        categories['social-media'].push(service);
      } else if (service.slug.startsWith('ad-')) {
        categories['ad-management'].push(service);
      } else if (service.slug.startsWith('bundle')) {
        categories['bundle'].push(service);
      }
    });

    return categories;
  };

  const handleServiceClick = (service: Service, detailPageSlug: string) => {
    setSelectedService(service);
    setCurrentDetailPageSlug(detailPageSlug);
    setIsModalOpen(true);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const categorizedServices = categorizeServices();

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Our Services
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              From websites to mobile apps, SEO to social media - we offer a complete suite of digital marketing services 
              designed to help your business grow online.
            </p>
          </motion.div>

          {/* Service Categories */}
          <div className="space-y-12 lg:space-y-16">
            {Object.entries(categorizedServices).map(([categoryKey, categoryServices]) => {
              if (categoryServices.length === 0) return null;
              
              const info = categoryInfo[categoryKey];
              const IconComponent = info.icon;

              return (
                <motion.div
                  key={categoryKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="scroll-mt-24"
                >
                  <Card className="border-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                    <CardHeader className="pb-4 lg:pb-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl lg:text-3xl mb-2">{info.title}</CardTitle>
                          <CardDescription className="text-base lg:text-lg">{info.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryServices.map((service) => (
                          <motion.div
                            key={service.id}
                            whileHover={{ scale: 1.02 }}
                            className="group relative p-4 bg-white dark:bg-gray-800 rounded-lg border hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => handleServiceClick(service, info.detailPageSlug)}
                          >
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Info className="w-5 h-5 text-blue-500" />
                            </div>
                            {service.popular && (
                              <div className="absolute -top-2 -right-2">
                                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                  ⭐ Popular
                                </span>
                              </div>
                            )}
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 pr-6 line-clamp-1">
                              {service.name.replace(/^.*?\s-\s/, '')}
                            </h4>
                            {service.priceRange && (
                              <div className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">
                                {service.priceRange}
                              </div>
                            )}
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                              {service.description}
                            </p>
                            <div className="flex items-center text-xs text-blue-900 dark:text-blue-300 font-semibold group-hover:text-blue-950 dark:group-hover:text-blue-200">
                              Click for details
                              <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 lg:pt-4">
                      <Link href={info.detailPageSlug === 'pricing' ? '/pricing' : `/services/${info.detailPageSlug}`} className="w-full">
                        <Button className="w-full" variant="default">
                          View {info.title} Details
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 lg:mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl lg:rounded-2xl p-8 lg:p-12 text-white">
              <h2 className="text-2xl lg:text-3xl font-bold mb-3 lg:mb-4">Not sure which service is right for you?</h2>
              <p className="text-base lg:text-xl mb-6 lg:mb-8 opacity-90">
                Let's talk! We'll help you choose the perfect solution for your business.
              </p>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-sm lg:text-base font-semibold hover:text-blue-700"
                onClick={() => window.location.href = '/contact'}
              >
                Schedule a Free Consultation
                <ArrowRight className="ml-2 w-4 h-4 lg:w-5 lg:h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
        detailPageSlug={currentDetailPageSlug}
      />

      <Footer />
    </>
  );
}
