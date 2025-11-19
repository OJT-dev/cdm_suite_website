
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send, CheckCircle, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';

interface ServiceConsultationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  serviceId: string;
  tierName?: string;
}

export function ServiceConsultationDialog({ 
  isOpen, 
  onClose, 
  serviceName, 
  serviceId,
  tierName 
}: ServiceConsultationDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: `I'm interested in learning more about ${serviceName}${tierName ? ` - ${tierName} tier` : ''}.`,
    formType: 'service-consultation',
    serviceId,
    serviceName,
    tierName: tierName || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: 'Consultation request sent!',
          description: "We'll contact you within 24 hours to schedule your consultation.",
        });
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error sending request',
        description: 'Please try again or contact us directly.',
        variant: 'destructive',
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

  const resetAndClose = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: `I'm interested in learning more about ${serviceName}${tierName ? ` - ${tierName} tier` : ''}.`,
      formType: 'service-consultation',
      serviceId,
      serviceName,
      tierName: tierName || ''
    });
    onClose();
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Request Received!
            </h2>
            <p className="text-gray-600 mb-6">
              We'll review your consultation request and reach out within 24 hours to schedule 
              your personalized strategy session.
            </p>
            <Button onClick={resetAndClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Book a Consultation
          </DialogTitle>
          <DialogDescription className="text-base">
            Schedule a free consultation to discuss {serviceName}
            {tierName && ` (${tierName} tier)`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Consultation Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
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
                  className="mt-1"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1"
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
                  className="mt-1"
                  placeholder="Your company"
                />
              </div>

              <div>
                <Label htmlFor="message">Additional Details</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 min-h-[80px]"
                  placeholder="Tell us about your goals..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Request Consultation
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Calendly Widget */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Or Book Instantly
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Schedule a 30-minute strategy session right now:
            </p>
            <div 
              className="calendly-inline-widget" 
              data-url="https://calendly.com/cdm-creativemedia/digital-marketing-power-session?hide_event_type_details=1&hide_gdpr_banner=1" 
              style={{minWidth: '280px', height: '550px'}}
            ></div>
            <Script
              src="https://assets.calendly.com/assets/external/widget.js"
              strategy="lazyOnload"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
