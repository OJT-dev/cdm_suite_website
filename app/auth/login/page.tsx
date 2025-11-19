

import { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield,
  BarChart3,
  Star,
  Sparkles,
  Gift,
  Target
} from "lucide-react";

export const metadata: Metadata = {
  title: "Login | CDM Suite",
  description: "Login to your CDM Suite account and access powerful marketing tools",
};

const benefits = [
  {
    icon: Gift,
    title: "Free Website Audit",
    description: "Get instant analysis of your site's performance and SEO",
    highlight: true
  },
  {
    icon: TrendingUp,
    title: "Track Your Growth",
    description: "Monitor your digital marketing performance in real-time"
  },
  {
    icon: BarChart3,
    title: "Actionable Insights",
    description: "Get data-driven recommendations to improve your results"
  },
  {
    icon: Zap,
    title: "Fast Support",
    description: "Access our team of experts whenever you need help"
  }
];

const testimonial = {
  quote: "CDM Suite transformed our online presence. Our traffic increased by 300% in just 3 months!",
  author: "Sarah Johnson",
  role: "CEO, TechStart Inc.",
  rating: 5
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; audit?: string };
}) {
  const showAuditMessage = searchParams.redirect === 'auditor' || searchParams.audit === 'true';

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="section-container py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Column - Benefits & Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Welcome Back to
                  <span className="block mt-2 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                    CDM Suite
                  </span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Log in to access your dashboard and continue growing your digital presence. Your marketing success is just one click away.
                </p>
              </div>

              {/* Special Audit Message */}
              {showAuditMessage && (
                <div className="p-5 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-2xl border-2 border-accent shadow-lg animate-in slide-in-from-top">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        🎉 Log in to save your audit results!
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Keep track of your website performance over time and access personalized recommendations in your dashboard.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        <span>Free audit • Instant results • No credit card required</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={index}
                      className={`flex gap-3 p-4 rounded-xl shadow-sm border transition-all ${
                        benefit.highlight
                          ? 'bg-gradient-to-r from-accent/10 to-secondary/10 border-accent hover:shadow-md'
                          : 'bg-white border-gray-100 hover:shadow-md'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          benefit.highlight
                            ? 'bg-gradient-to-br from-accent to-secondary'
                            : 'bg-gradient-to-br from-secondary to-accent'
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Testimonial */}
              <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-2xl p-6 border border-secondary/20">
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 items-center text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  <span>500+ Happy Clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  <span>Bank-Level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-secondary" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Login to Your Account
                </h2>
                <p className="text-gray-600">
                  Access your dashboard and grow your business
                </p>
              </div>
              <LoginForm />
              
              {/* Quick Access to Audit */}
              {!showAuditMessage && (
                <div className="mt-6 text-center p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <p className="font-semibold text-gray-900">
                      Want a Free Audit First?
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Get instant insights into your website's performance before signing in.
                  </p>
                  <Link 
                    href="/auditor"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Get Your Free Audit
                  </Link>
                </div>
              )}
              
              {/* Additional CTA */}
              <div className="mt-6 text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-700 mb-2">
                  New to CDM Suite? Start your journey today!
                </p>
                <Link 
                  href="/auth/signup"
                  className="text-secondary hover:text-accent font-semibold text-sm transition-colors"
                >
                  Create a free account →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
