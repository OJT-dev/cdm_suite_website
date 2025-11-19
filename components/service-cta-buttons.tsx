
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ServiceCTAButtonsProps {
  serviceId?: string;
  price: number;
  serviceName: string;
  onScheduleClick?: () => void;
  variant?: 'inline' | 'stacked';
  className?: string;
}

export function ServiceCTAButtons({
  serviceId,
  price,
  serviceName,
  onScheduleClick,
  variant = 'inline',
  className = '',
}: ServiceCTAButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      // Create checkout session for guest or logged-in user
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to initiate checkout');
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (status === 'authenticated') {
      // User is logged in, show options
      setShowOptions(true);
    } else {
      // User not logged in, show options dialog
      setShowOptions(true);
    }
  };

  const handleContactSales = () => {
    router.push('/contact');
  };

  if (variant === 'inline') {
    return (
      <>
        <div className={`flex flex-col sm:flex-row gap-4 justify-center ${className}`}>
          <Button 
            onClick={handleGetStarted}
            disabled={loading}
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-8 rounded-full transition-transform duration-300 transform hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Get Started Now
              </>
            )}
          </Button>
          {onScheduleClick && (
            <Button 
              onClick={onScheduleClick}
              size="lg" 
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white font-bold py-6 px-8 rounded-full"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule a Call
            </Button>
          )}
        </div>

        <Dialog open={showOptions} onOpenChange={setShowOptions}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>How would you like to proceed?</DialogTitle>
              <DialogDescription>
                Choose the option that works best for you
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button
                onClick={() => {
                  setShowOptions(false);
                  handleCheckout();
                }}
                disabled={loading}
                className="w-full justify-start h-auto py-4 px-4 text-left"
                variant="outline"
              >
                <ShoppingCart className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Purchase Now</div>
                  <div className="text-sm text-gray-500">Secure checkout • Get started immediately</div>
                </div>
              </Button>
              
              {onScheduleClick && (
                <Button
                  onClick={() => {
                    setShowOptions(false);
                    onScheduleClick();
                  }}
                  className="w-full justify-start h-auto py-4 px-4 text-left"
                  variant="outline"
                >
                  <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Schedule a Free Consultation</div>
                    <div className="text-sm text-gray-500">Let's discuss your needs first</div>
                  </div>
                </Button>
              )}
              
              <Button
                onClick={() => {
                  setShowOptions(false);
                  handleContactSales();
                }}
                className="w-full justify-start h-auto py-4 px-4 text-left"
                variant="outline"
              >
                <MessageSquare className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Contact Sales</div>
                  <div className="text-sm text-gray-500">Custom solutions or have questions?</div>
                </div>
              </Button>

              {status !== 'authenticated' && (
                <Button
                  onClick={() => {
                    router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
                  }}
                  className="w-full justify-start h-auto py-4 px-4 text-left"
                  variant="ghost"
                >
                  <div className="text-sm text-gray-600">
                    Already have an account? <span className="text-primary font-semibold">Sign in</span>
                  </div>
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Stacked variant for mobile or compact layouts
  return (
    <>
      <div className={`flex flex-col gap-3 ${className}`}>
        <Button 
          onClick={handleGetStarted}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Get Started
            </>
          )}
        </Button>
        
        {onScheduleClick && (
          <Button 
            onClick={onScheduleClick}
            variant="outline"
            className="w-full"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Call
          </Button>
        )}
      </div>

      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How would you like to proceed?</DialogTitle>
            <DialogDescription>
              Choose the option that works best for you
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              onClick={() => {
                setShowOptions(false);
                handleCheckout();
              }}
              disabled={loading}
              className="w-full justify-start h-auto py-4 px-4 text-left"
              variant="outline"
            >
              <ShoppingCart className="w-5 h-5 mr-3 flex-shrink-0" />
              <div>
                <div className="font-semibold">Purchase Now</div>
                <div className="text-sm text-gray-500">Secure checkout • Get started immediately</div>
              </div>
            </Button>
            
            {onScheduleClick && (
              <Button
                onClick={() => {
                  setShowOptions(false);
                  onScheduleClick();
                }}
                className="w-full justify-start h-auto py-4 px-4 text-left"
                variant="outline"
              >
                <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Schedule a Free Consultation</div>
                  <div className="text-sm text-gray-500">Let's discuss your needs first</div>
                </div>
              </Button>
            )}
            
            <Button
              onClick={() => {
                setShowOptions(false);
                handleContactSales();
              }}
              className="w-full justify-start h-auto py-4 px-4 text-left"
              variant="outline"
            >
              <MessageSquare className="w-5 h-5 mr-3 flex-shrink-0" />
              <div>
                <div className="font-semibold">Contact Sales</div>
                <div className="text-sm text-gray-500">Custom solutions or have questions?</div>
              </div>
            </Button>

            {status !== 'authenticated' && (
              <Button
                onClick={() => {
                  router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
                }}
                className="w-full justify-start h-auto py-4 px-4 text-left"
                variant="ghost"
              >
                <div className="text-sm text-gray-600">
                  Already have an account? <span className="text-primary font-semibold">Sign in</span>
                </div>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
