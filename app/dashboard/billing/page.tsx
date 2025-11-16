
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTierConfig } from "@/lib/tier-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Loader2, Coins, Zap, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// SaaS subscriptions - premium DIY tools with professional features
const PRICING_TIERS = [
  {
    id: "starter",
    name: "Starter",
    price: 199,
    priceRange: "$199",
    description: "Professional DIY tools for serious entrepreneurs",
    trial: false,
    creditsPerMonth: 5,
  },
  {
    id: "growth",
    name: "Growth",
    price: 499,
    priceRange: "$499",
    description: "Advanced features for growing businesses",
    popular: true,
    creditsPerMonth: 15,
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    priceRange: "$999",
    description: "Complete suite for established companies",
    creditsPerMonth: 40,
  },
];

const CREDIT_PACKAGES = [
  {
    id: "credits_5",
    credits: 5,
    price: 25,
    description: "Quick prototyping",
    popular: false,
  },
  {
    id: "credits_10",
    credits: 10,
    price: 45,
    description: "Most popular",
    popular: true,
    savings: "Save $5",
  },
  {
    id: "credits_25",
    credits: 25,
    price: 100,
    description: "Best value",
    popular: false,
    savings: "Save $25",
  },
];

function BillingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name?: string | null;
    tier: string;
    credits?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [processingCredits, setProcessingCredits] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const tier = searchParams.get("tier");

    if (success === "true" && tier) {
      toast({
        title: "Subscription Successful!",
        description: `Welcome to the ${tier} plan! Your account will be updated shortly.`,
      });
      // Refresh the page to update the user's tier
      setTimeout(() => {
        window.location.href = "/dashboard/billing";
      }, 2000);
    } else if (canceled === "true") {
      toast({
        title: "Checkout Canceled",
        description: "Your subscription was not completed. You can try again anytime.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Fetch credits
        const creditsResponse = await fetch("/api/credits");
        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json();
          setUserCredits(creditsData.credits || 0);
        }
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    setProcessingTier(tierId);
    try {
      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tierId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
      setProcessingTier(null);
    }
  };

  const handleContactSales = (tierId: string) => {
    // Navigate to contact form with pre-filled information
    router.push(`/contact?subject=Upgrade to ${tierId} Plan`);
  };

  const handleBuyCredits = async (packageId: string, credits: number, price: number) => {
    setProcessingCredits(packageId);
    try {
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          packageId,
          credits,
          price
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to purchase credits");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Credit purchase error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to purchase credits. Please try again.",
        variant: "destructive",
      });
      setProcessingCredits(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentTierConfig = user ? getTierConfig(user.tier) : getTierConfig("free");

  return (
    <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Plans & Billing
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              You're currently on the {currentTierConfig.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {currentTierConfig.name}
                </p>
                <p className="text-gray-600">
                  {("priceRange" in currentTierConfig ? (currentTierConfig as any).priceRange : "$0")}/mo
                </p>
              </div>
              {user?.tier !== "free" && user?.tier !== "enterprise" && (
                <Button 
                  variant="outline"
                  onClick={() => window.open("https://billing.stripe.com/p/login/test_aEU6qM5MK8fO1nG000", "_blank")}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Billing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Services Upgrade CTA */}
        <Card className="border-2 border-gradient-to-r from-blue-600 to-purple-600 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-20 -ml-32 -mb-32"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-2xl">Ready for Professional Results?</CardTitle>
                </div>
                <CardDescription className="text-base">
                  DIY tools are great for prototyping, but our professional services deliver 
                  production-ready, custom solutions that drive real business results.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/60 backdrop-blur p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">🛠️</span>
                  </div>
                  DIY Website Builder
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    AI-generated templates
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Quick prototyping (15 mins)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Basic features only
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Self-service support
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Starting at</p>
                  <p className="text-2xl font-bold text-blue-600">$5 per website</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-4 rounded-lg relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    Professional Website Creation
                  </h4>
                  <ul className="space-y-2 text-sm opacity-95">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      100% custom design & development
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Advanced features & integrations
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      SEO optimization included
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Dedicated project manager
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      30-day support & maintenance
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Professional copywriting
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-sm opacity-75">Professional packages</p>
                    <p className="text-2xl font-bold">$420 - $3,750</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={() => router.push('/pricing')}
              >
                View Professional Services
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1 bg-white hover:bg-gray-50"
                onClick={() => router.push('/contact?subject=Website%20Development')}
              >
                Talk to Our Team
              </Button>
            </div>
            
            <p className="text-center text-sm text-gray-600 mt-4">
              💡 <strong>Pro Tip:</strong> Use the DIY builder to test your ideas, then let our team build the production version
            </p>
          </CardContent>
        </Card>

        {/* Purchase Credits Section */}
        {searchParams.get("credits") === "true" && (
          <Card className="border-blue-300 bg-blue-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle>Need More Credits?</CardTitle>
                  <CardDescription>
                    You need credits to create more websites
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Buy Credits */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Coins className="w-6 h-6 text-blue-600" />
                Project Credits
              </h2>
              <p className="text-gray-600 mt-1">
                Your current balance: <span className="font-bold text-lg">{userCredits} credits</span>
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <strong>💡 First project is FREE!</strong> After that, each website creation costs 1 credit. 
            Purchase credit packages below for unlimited website building.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CREDIT_PACKAGES.map((pkg) => {
              const isProcessing = processingCredits === pkg.id;
              
              return (
                <Card
                  key={pkg.id}
                  className={pkg.popular ? "border-2 border-blue-600 relative" : ""}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Best Value
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Coins className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold">
                      {pkg.credits} Credits
                    </CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${pkg.price}</span>
                      {pkg.savings && (
                        <div className="text-green-600 font-medium mt-2">
                          {pkg.savings}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Create {pkg.credits} websites</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Credits never expire</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Works with any plan</span>
                      </li>
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={pkg.popular ? "default" : "outline"}
                      onClick={() => handleBuyCredits(pkg.id, pkg.credits, pkg.price)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4 mr-2" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Pricing Tiers */}
        {user?.tier === "free" && (
          <>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upgrade Your Plan
              </h2>
              <p className="text-gray-600">
                Choose the plan that best fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRICING_TIERS.map((tier) => {
                const config = getTierConfig(tier.id);
                const isProcessing = processingTier === tier.id;
                
                return (
                  <Card
                    key={tier.id}
                    className={tier.popular ? "border-2 border-blue-600" : ""}
                  >
                    {tier.popular && (
                      <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold rounded-t-lg">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">
                          {tier.priceRange}
                        </span>
                        <span className="text-gray-600">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {config.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        variant={tier.popular ? "default" : "outline"}
                        onClick={() => {
                          if (tier.id === "starter") {
                            handleSubscribe(tier.id);
                          } else {
                            handleContactSales(tier.id);
                          }
                        }}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : tier.id === "starter" ? (
                          <>
                            {tier.trial ? "Start 7-Day Trial" : "Subscribe Now"}
                          </>
                        ) : (
                          "Contact Sales"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Success Message for Paid Plans */}
        {user?.tier !== "free" && (
          <Card>
            <CardHeader>
              <CardTitle>Thank You for Your Subscription!</CardTitle>
              <CardDescription>
                Your {currentTierConfig.name} plan is active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                You now have access to all {currentTierConfig.name} features. If you need to upgrade or have any questions, 
                please contact our sales team.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <BillingPageContent />
    </Suspense>
  );
}
