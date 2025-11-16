
import { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield,
  BarChart3,
  Gift,
  Sparkles,
  Target,
  DollarSign,
  Globe,
  MessageSquare
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up | CDM Suite",
  description: "Create your CDM Suite account and unlock powerful marketing tools",
};

const benefits = [
  {
    icon: Gift,
    title: "Free Website Audit",
    description: "Get a comprehensive analysis of your current online presence",
    highlight: true
  },
  {
    icon: Target,
    title: "Custom Strategy",
    description: "Receive a personalized marketing plan tailored to your business goals"
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track your performance with detailed insights and reporting"
  },
  {
    icon: Zap,
    title: "Fast Implementation",
    description: "See results quickly with our proven marketing strategies"
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "Access our team of marketing professionals whenever you need help"
  },
  {
    icon: Shield,
    title: "No Long-Term Contracts",
    description: "Flexible monthly plans that scale with your business"
  }
];

const features = [
  {
    category: "Marketing Services",
    items: [
      "SEO optimization for higher rankings",
      "Social media management & growth",
      "Targeted advertising campaigns",
      "Content creation & strategy"
    ]
  },
  {
    category: "Web Development",
    items: [
      "Custom website design & development",
      "Mobile app creation",
      "E-commerce solutions",
      "Ongoing maintenance & support"
    ]
  },
  {
    category: "Business Tools",
    items: [
      "Lead capture & automation",
      "Email marketing campaigns",
      "Performance tracking dashboard",
      "Competitor analysis tools"
    ]
  }
];

const pricingHighlights = [
  { label: "Free Tier", description: "Start with a free website audit", icon: Gift },
  { label: "Starter Plans", description: "From $250/mo with 7-day trial", icon: DollarSign },
  { label: "No Hidden Fees", description: "Transparent, all-inclusive pricing", icon: CheckCircle2 }
];

export default function SignupPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const referralCode = searchParams.ref;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="section-container py-12 lg:py-20">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary to-accent text-charcoal rounded-full font-semibold text-sm mb-4 shadow-lg">
                <Sparkles className="w-4 h-4" />
                Limited Time: Get Your First Month 50% Off
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Start Growing Your Business
                <span className="block mt-2 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  With CDM Suite
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join hundreds of businesses that trust CDM Suite to handle their digital marketing. 
                Create your account now and get immediate access to powerful tools that drive real results.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - What You Get */}
              <div className="space-y-8">
                {/* Main Benefits */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-7 h-7 text-accent" />
                    What You Get When You Sign Up
                  </h2>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => {
                      const Icon = benefit.icon;
                      return (
                        <div 
                          key={index}
                          className={`flex gap-4 p-4 rounded-xl border transition-all ${
                            benefit.highlight 
                              ? 'bg-gradient-to-r from-accent/10 to-secondary/10 border-accent shadow-md' 
                              : 'bg-white border-gray-100 hover:shadow-md'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              benefit.highlight
                                ? 'bg-gradient-to-br from-accent to-secondary'
                                : 'bg-gradient-to-br from-secondary to-accent'
                            }`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                              {benefit.title}
                            </h3>
                            <p className="text-gray-600">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing Highlights */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-secondary" />
                    Flexible Pricing Options
                  </h3>
                  <div className="space-y-3">
                    {pricingHighlights.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <Icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Feature Categories */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-secondary" />
                    Complete Digital Marketing Suite
                  </h3>
                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <div key={index} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          {feature.category}
                        </h4>
                        <ul className="space-y-2">
                          {feature.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust Signals */}
                <div className="flex flex-wrap gap-6 items-center text-sm text-gray-600 pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-secondary" />
                    <span className="font-medium">500+ Active Clients</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span className="font-medium">Average 3x ROI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-secondary" />
                    <span className="font-medium">24/7 Expert Support</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Signup Form */}
              <div className="lg:sticky lg:top-24">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Create Your Free Account
                  </h2>
                  <p className="text-gray-600">
                    No credit card required • Start free today
                  </p>
                  {referralCode && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        🎉 Special Offer: You've been referred! Get an extra 10% off your first 3 months.
                      </p>
                    </div>
                  )}
                </div>
                
                <SignupForm referralCode={referralCode} />
                
                {/* Additional Info */}
                <div className="mt-6 space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl border border-secondary/20">
                    <p className="text-sm text-gray-700 mb-2 font-medium">
                      Already have an account?
                    </p>
                    <Link 
                      href="/auth/login"
                      className="text-secondary hover:text-accent font-semibold text-sm transition-colors"
                    >
                      Log in here →
                    </Link>
                  </div>

                  <div className="text-center text-xs text-gray-500">
                    By signing up, you agree to our{" "}
                    <Link href="/terms" className="text-secondary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-secondary hover:underline">
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
