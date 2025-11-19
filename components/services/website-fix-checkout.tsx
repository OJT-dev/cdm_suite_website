
'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { 
  Check, 
  Rocket, 
  Shield, 
  Clock, 
  Award, 
  Sparkles,
  CreditCard,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

function WebsiteFixCheckoutInner() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [serviceType, setServiceType] = useState<'done-for-you' | 'self-service'>('done-for-you');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    websiteUrl: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill from URL params or session
  useEffect(() => {
    if (searchParams) {
      const email = searchParams.get('email');
      const name = searchParams.get('name');
      const websiteUrl = searchParams.get('website');
      
      setFormData(prev => ({
        ...prev,
        email: email || session?.user?.email || '',
        name: name || session?.user?.name || '',
        websiteUrl: websiteUrl || ''
      }));
    }
  }, [searchParams, session]);

  const serviceOptions = {
    'done-for-you': {
      title: 'Done-For-You Service',
      description: 'We handle everything - you just approve',
      price: 100,
      features: [
        '✅ Complete website audit & fix',
        '✅ Dedicated project manager',
        '✅ Priority support & updates',
        '✅ Weekly progress reports',
        '✅ Guaranteed launch in 7 days'
      ],
      popular: true
    },
    'self-service': {
      title: 'Self-Service Platform',
      description: 'Access our platform + guided tutorials',
      price: 50,
      features: [
        '✅ Platform access & tools',
        '✅ Step-by-step video tutorials',
        '✅ Email support',
        '✅ Community forum access',
        '✅ Flexible timeline'
      ],
      popular: false
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name || !formData.websiteUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/checkout/website-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceType,
          priceId: serviceType === 'done-for-you' ? 'price_website_fix_dfy' : 'price_website_fix_self',
          userId: session?.user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again or contact support.');
      setIsLoading(false);
    }
  };

  const selectedService = serviceOptions[serviceType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200">
            <Clock className="w-3 h-3 mr-1" />
            Limited Time Offer
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900">
            Website Performance Fix Service
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transform your website in just 7 days. Cancel anytime, no long-term contract.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Service Selection & Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Service Type</CardTitle>
                <CardDescription>Select the option that works best for you</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={serviceType} onValueChange={(value: any) => setServiceType(value)}>
                  <div className="space-y-4">
                    {Object.entries(serviceOptions).map(([key, option]) => (
                      <div
                        key={key}
                        className={`relative border-2 rounded-lg p-5 cursor-pointer transition-all ${
                          serviceType === key
                            ? 'border-blue-600 bg-blue-50 shadow-lg'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                        onClick={() => setServiceType(key as any)}
                      >
                        {option.popular && (
                          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white">
                            Most Popular
                          </Badge>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value={key} id={key} className="mt-1" />
                          <div className="flex-1">
                            <label htmlFor={key} className="cursor-pointer">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-slate-900">{option.title}</h3>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-blue-600">${option.price}</div>
                                  <div className="text-sm text-slate-600">/month</div>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 mb-3">{option.description}</p>
                              <ul className="space-y-2">
                                {option.features.map((feature, idx) => (
                                  <li key={idx} className="text-sm text-slate-700">{feature}</li>
                                ))}
                              </ul>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>We'll use this to set up your service</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={isAuthenticated}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Your Company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Website URL *</Label>
                    <Input
                      id="websiteUrl"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Continue to Payment - ${selectedService.price}/month
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-600">
                    Secured by Stripe • Cancel anytime • Quality guaranteed
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Guarantees */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="sticky top-24">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <div className="font-semibold text-slate-900">{selectedService.title}</div>
                    <div className="text-sm text-slate-600">Monthly subscription</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${selectedService.price}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">No setup fees</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Cancel anytime</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Quality guarantee - we work until you're satisfied</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">Billed monthly, not annually</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guarantees */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-900 mb-1">100% Satisfaction Commitment</div>
                    <p className="text-sm text-green-800">
                      We're committed to your success. We'll work with you until you're completely satisfied with the results.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Rocket className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-900 mb-1">Guaranteed Results</div>
                    <p className="text-sm text-green-800">
                      We guarantee at least 20-point improvement in your website score or your money back.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-900 mb-1">Fast Turnaround</div>
                    <p className="text-sm text-green-800">
                      Your website improvements will be completed and launched within 7 days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Proof */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-slate-900">Trusted by 500+ Businesses</span>
                </div>
                <p className="text-sm text-slate-600 italic mb-2">
                  "From a 52 audit score to 94 in just 5 days. Website loads 3x faster and we're getting double the leads!"
                </p>
                <p className="text-xs text-slate-500">— Jennifer M., Small Business Owner</p>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-slate-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-blue-600 mx-auto" />
                  <div className="font-semibold text-slate-900">Need Help?</div>
                  <p className="text-sm text-slate-600">
                    Have questions? Call us at{' '}
                    <a href="tel:8622727623" className="text-blue-600 font-semibold hover:underline">
                      (862) 272-7623
                    </a>
                    {' '}or{' '}
                    <Link href="/contact" className="text-blue-600 font-semibold hover:underline">
                      contact us
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WebsiteFixCheckout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <WebsiteFixCheckoutInner />
    </Suspense>
  );
}
