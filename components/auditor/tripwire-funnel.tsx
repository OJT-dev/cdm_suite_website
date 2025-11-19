
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Clock, TrendingUp, Zap, Award, ArrowRight, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface TripwireFunnelProps {
  websiteUrl: string;
  email: string;
  name: string;
  overallScore: number;
  onComplete: () => void;
}

export default function TripwireFunnel({ websiteUrl, email, name, overallScore, onComplete }: TripwireFunnelProps) {
  const [step, setStep] = useState<'offer1' | 'upsell1' | 'complete'>('offer1');
  const [accepted, setAccepted] = useState<string[]>([]);

  // Offer 1: $100/month Website Fix Service
  const offer1 = {
    id: 'website-fix-service',
    title: '🚀 Website Performance Fix',
    monthlyPrice: 100,
    setupFee: 0, // Waived for limited time
    features: [
      '✅ We fix ALL critical issues from your audit',
      '✅ Performance optimization (speed, mobile, SEO)',
      '✅ Guaranteed 20+ point score improvement',
      '✅ Launched in less than 7 days',
      '✅ Cancel anytime (no long-term contract)',
      '✅ Monthly performance monitoring included'
    ],
    options: [
      {
        type: 'done-for-you',
        label: 'Done-For-You',
        description: 'We handle everything - you just approve',
        popular: true
      },
      {
        type: 'self-service',
        label: 'Self-Service',
        description: 'Access our platform + guided tutorials',
        popular: false
      }
    ],
    urgency: 'Limited to first 20 signups this week',
    cta: 'Start My Website Fix - $100/month',
    guarantee: 'Cancel anytime. First month money-back guarantee.'
  };

  // Upsell 1: Add-on Services at $100/month each
  const upsell1 = {
    id: 'growth-bundle',
    title: '⚡ Add Growth Services',
    addons: [
      {
        id: 'seo-boost',
        name: 'SEO Optimization',
        price: 100,
        description: 'Rank higher on Google',
        features: ['Keyword research', 'Content optimization', 'Monthly ranking reports']
      },
      {
        id: 'content-engine',
        name: 'Content Creation',
        price: 100,
        description: '4 blog posts + 12 social posts/month',
        features: ['SEO-optimized blogs', 'Social media content', 'Content calendar']
      },
      {
        id: 'email-automation',
        name: 'Email Marketing',
        price: 100,
        description: 'Automated email sequences',
        features: ['Welcome series', 'Nurture campaigns', 'Performance tracking']
      }
    ],
    urgency: 'ONE-TIME OFFER: Bundle pricing only available now',
    cta: 'Add Growth Services',
    bonus: '🎁 Bundle 2+ services: Get first month at 50% off'
  };

  const handleAccept = async (offerId: string, selectedOptions?: any) => {
    setAccepted([...accepted, offerId]);
    
    // Track in CRM
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          source: 'Audit Tripwire',
          interest: `Accepted: ${offerId}`,
          tags: ['audit', 'tripwire-accepted', offerId],
          notes: `Accepted ${offerId} offer after website audit (${websiteUrl}, score: ${overallScore}). Options: ${JSON.stringify(selectedOptions || {})}`
        })
      });
    } catch (error) {
      console.error('Failed to track acceptance:', error);
    }

    // Redirect to checkout for main offer
    if (step === 'offer1') {
      // Redirect to checkout page with pre-filled info
      const checkoutUrl = `/services/website-fix?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&website=${encodeURIComponent(websiteUrl)}`;
      window.location.href = checkoutUrl;
      return;
    }
    
    // For upsells, track and continue
    if (step === 'upsell1') {
      setStep('complete');
      setTimeout(onComplete, 2000);
    }
  };

  const handleDecline = async () => {
    if (step === 'offer1') {
      setStep('complete');
      setTimeout(onComplete, 2000);
    } else {
      setStep('complete');
      setTimeout(onComplete, 2000);
    }
  };

  const renderMainOffer = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto relative my-4">
        <button
          onClick={handleDecline}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        <CardContent className="p-8">
          {/* Urgency Banner */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg mb-6 text-center font-bold flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 animate-pulse" />
            {offer1.urgency}
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-900 mb-2 text-center">
            {offer1.title}
          </h2>
          <p className="text-center text-gray-600 text-lg mb-6">
            The Utility-Style Website Service You Can Actually Afford
          </p>

          {/* Price Display */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8 mb-6 text-center border-2 border-green-500">
            <div className="text-6xl font-bold text-green-600 mb-2">
              $100
              <span className="text-2xl text-gray-600 font-normal">/month</span>
            </div>
            <p className="text-gray-700 text-lg font-semibold mb-2">
              No setup fees. No hidden costs. Cancel anytime.
            </p>
            <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
              <Rocket className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-900 font-bold">Launched in less than 7 days</span>
            </div>
          </div>

          {/* Service Options */}
          <div className="mb-6">
            <h3 className="font-bold text-xl mb-4 text-gray-900 text-center">Choose Your Service Style:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {offer1.options.map((option) => (
                <div
                  key={option.type}
                  className={`relative border-2 rounded-lg p-5 cursor-pointer transition-all ${
                    option.popular 
                      ? 'border-green-500 bg-green-50 shadow-lg' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  {option.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  <div className="text-center">
                    <h4 className="font-bold text-lg text-gray-900 mb-2">{option.label}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="font-bold text-xl mb-4 text-gray-900">What's Included:</h3>
            <ul className="space-y-3">
              {offer1.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800 font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Proof */}
          <div className="bg-blue-50 rounded-lg p-5 mb-6 border-l-4 border-blue-500">
            <div className="flex items-start gap-3 mb-2">
              <Award className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Real Results</p>
                <p className="text-sm text-blue-800 italic">
                  "We went from a 52 audit score to 94 in just 5 days. Website loads 3x faster now and we're getting double the leads!"
                </p>
                <p className="text-xs text-blue-600 mt-1">— Jennifer M., Small Business Owner</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => handleAccept(offer1.id)}
            className="w-full py-7 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all mb-4 btn-glow"
          >
            <Sparkles className="w-6 h-6 mr-2" />
            {offer1.cta}
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>

          {/* Guarantee */}
          <div className="text-center text-sm text-gray-600 mb-4 bg-gray-50 py-3 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium">{offer1.guarantee}</span>
            </div>
          </div>

          {/* Decline Option */}
          <button
            onClick={handleDecline}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
          >
            No thanks, I'll view my report without the fix service
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderUpsell = () => {
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

    const toggleAddon = (addonId: string) => {
      setSelectedAddons(prev => 
        prev.includes(addonId) 
          ? prev.filter(id => id !== addonId)
          : [...prev, addonId]
      );
    };

    const totalPrice = selectedAddons.length * 100;
    const discountedPrice = selectedAddons.length >= 2 ? totalPrice * 0.5 : totalPrice;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      >
        <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto relative my-4">
          <CardContent className="p-8">
            {/* Urgency Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg mb-6 text-center font-bold flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 animate-pulse" />
              {upsell1.urgency}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              {upsell1.title}
            </h2>
            <p className="text-center text-gray-600 text-lg mb-6">
              Supercharge your growth with these add-on services at just $100/month each
            </p>

            {/* Bonus Badge */}
            {selectedAddons.length >= 2 && (
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6 text-center animate-pulse">
                <p className="text-yellow-900 font-bold text-lg">
                  🎉 {upsell1.bonus}
                </p>
              </div>
            )}

            {/* Add-on Services */}
            <div className="space-y-4 mb-6">
              {upsell1.addons.map((addon) => (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
                    selectedAddons.includes(addon.id)
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAddons.includes(addon.id)
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedAddons.includes(addon.id) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <h4 className="font-bold text-xl text-gray-900">{addon.name}</h4>
                      </div>
                      <p className="text-gray-600 mb-2">{addon.description}</p>
                      <ul className="space-y-1">
                        {addon.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-3xl font-bold text-green-600">${addon.price}</p>
                      <p className="text-sm text-gray-600">/month</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Price */}
            {selectedAddons.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-green-500">
                <div className="text-center">
                  {selectedAddons.length >= 2 && (
                    <p className="text-gray-600 line-through text-lg mb-1">
                      Regular: ${totalPrice}/month
                    </p>
                  )}
                  <p className="text-4xl font-bold text-green-600 mb-2">
                    ${discountedPrice}
                    <span className="text-lg text-gray-600 font-normal">/month</span>
                  </p>
                  <p className="text-gray-700">
                    {selectedAddons.length} service{selectedAddons.length > 1 ? 's' : ''} selected
                  </p>
                  {selectedAddons.length >= 2 && (
                    <p className="text-green-700 font-semibold mt-2">
                      You're saving ${totalPrice - discountedPrice}/month!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            {selectedAddons.length > 0 ? (
              <Button
                onClick={() => handleAccept(upsell1.id, { addons: selectedAddons, price: discountedPrice })}
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all mb-4"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Add Selected Services - ${discountedPrice}/mo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleDecline}
                className="w-full py-6 text-lg font-bold bg-gray-600 hover:bg-gray-700 text-white shadow-xl hover:shadow-2xl transition-all mb-4"
              >
                Continue Without Add-ons
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}

            {/* Skip Option */}
            <button
              onClick={handleDecline}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
            >
              No thanks, I'll just stick with the website fix service
            </button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'offer1' && renderMainOffer()}
      {step === 'upsell1' && renderUpsell()}
      {step === 'complete' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {accepted.length > 0 ? "Welcome Aboard! 🎉" : "Report Ready!"}
              </h3>
              <p className="text-gray-600 mb-4">
                {accepted.length > 0 
                  ? "We'll email you within 24 hours to kick off your website improvements!"
                  : "Your full audit report is ready to view below."}
              </p>
              <Button
                onClick={onComplete}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                View Full Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
