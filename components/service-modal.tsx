
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ExternalLink, Sparkles, ShoppingCart, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ServiceConsultationDialog } from './service-consultation-dialog';
import { getTierById } from '@/lib/pricing-tiers';
import { useToast } from '@/hooks/use-toast';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    slug: string;
    name: string;
    description: string;
    priceRange?: string;
    features?: string[];
    popular?: boolean;
    category?: string;
  } | null;
  detailPageSlug?: string;
}

export function ServiceModal({ isOpen, onClose, service, detailPageSlug }: ServiceModalProps) {
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  if (!service) return null;

  const serviceName = service.name.replace(/^.*?\s-\s/, '');
  const topFeatures = service.features?.slice(0, 4) || [];

  // Get the specific tier for this service based on its slug
  const getSpecificTier = () => {
    const tier = getTierById(service.slug);
    return tier ? [tier] : []; // Return as array for consistency with existing code
  };

  const pricingTiers = getSpecificTier();

  const handlePayNow = async (tier?: any) => {
    setIsProcessingPayment(true);
    setSelectedTier(tier || null);

    try {
      // Use tier if available, otherwise use service defaults
      const payload = tier ? {
        serviceId: service.id,
        tierId: tier.id,
        tierName: tier.name,
        amount: tier.price
      } : {
        serviceId: service.id,
        tierId: service.slug,
        tierName: service.name,
        amount: parseFloat(service.priceRange?.replace(/[^0-9.-]+/g, '') || '0')
      };

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initiate checkout. Please try again.',
        variant: 'destructive',
      });
      setIsProcessingPayment(false);
      setSelectedTier(null);
    }
  };

  const handleBookConsultation = (tier?: any) => {
    setSelectedTier(tier || null);
    setConsultationOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2 flex items-center gap-2">
                  {serviceName}
                  {service.popular && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-base text-gray-600 leading-relaxed">
              {service.description}
            </DialogDescription>
          </DialogHeader>

          {topFeatures.length > 0 && (
            <div className="space-y-4 py-4">
              <h3 className="font-semibold text-lg">Key Features:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                    </div>
                    <span className="text-gray-700 leading-relaxed text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing for Selected Tier */}
          {pricingTiers.length > 0 && (
            <div className="space-y-4 py-4 border-t">
              <h3 className="font-semibold text-lg">Pricing & Details:</h3>
              <div className="grid grid-cols-1 gap-4">
                {pricingTiers.map((tier: any) => (
                  <div
                    key={tier.id}
                    className="relative p-6 border-2 rounded-lg border-primary bg-gradient-to-br from-primary/5 to-primary/10"
                  >
                    {tier.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-primary">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    )}
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-xl mb-3">{tier.name} Plan</h4>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-primary">
                          ${tier.price}
                        </span>
                        <span className="text-lg text-gray-500">/month</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{tier.description}</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <h5 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                        What's Included:
                      </h5>
                      {tier.features.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                          </div>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        onClick={() => handlePayNow(tier)}
                        disabled={isProcessingPayment}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        size="lg"
                      >
                        {isProcessingPayment && selectedTier?.id === tier.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Pay Now - ${tier.price}/mo
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleBookConsultation(tier)}
                        variant="outline"
                        className="w-full border-2"
                        size="lg"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Free Consultation
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If no tiers, show generic options */}
          {pricingTiers.length === 0 && (
            <div className="space-y-4 pt-4 border-t">
              {service.priceRange && (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-primary/20">
                  <p className="text-sm text-gray-600 mb-2">Starting Price:</p>
                  <p className="text-3xl font-bold text-primary mb-4">{service.priceRange}</p>
                  <p className="text-sm text-gray-600 mb-6">{service.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      onClick={() => handlePayNow()}
                      disabled={isProcessingPayment}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      size="lg"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Purchase Now
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleBookConsultation()}
                      variant="outline"
                      className="w-full border-2"
                      size="lg"
                    >
                      <Calendar className="mr-2 w-4 h-4" />
                      Book Consultation
                    </Button>
                  </div>
                </div>
              )}
              {!service.priceRange && (
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => handleBookConsultation()}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    size="lg"
                  >
                    <Calendar className="mr-2 w-4 h-4" />
                    Get Custom Quote
                  </Button>
                  <Link href={`/services/${service.slug}`} className="w-full">
                    <Button variant="outline" className="w-full" size="lg">
                      View Full Details
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t">
            <p className="text-sm text-gray-500 text-center w-full">
              💡 Not sure which plan is right? Book a free consultation and we'll help you choose!
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ServiceConsultationDialog
        isOpen={consultationOpen}
        onClose={() => {
          setConsultationOpen(false);
          setSelectedTier(null);
        }}
        serviceName={serviceName}
        serviceId={service.id}
        tierName={selectedTier?.name}
      />
    </>
  );
}
