"use client";

import { useState, useMemo } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CalendlyScheduler from "@/components/calendly-scheduler";
import { CheckoutButton } from "@/components/checkout-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, TrendingUp, Target, BarChart3, Zap, Shield, Clock, Users, AlertCircle, Star, Award, ArrowRight, Gift } from "lucide-react";
import Image from "next/image";
import { 
  WEB_DEVELOPMENT_TIERS, 
  WEBSITE_MAINTENANCE_TIERS,
  APP_CREATION_TIERS,
  APP_MAINTENANCE_TIERS,
  SEO_TIERS,
  SOCIAL_MEDIA_TIERS,
  AD_MANAGEMENT_TIERS
} from "@/lib/pricing-tiers";

interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular: boolean;
}

interface ServicePageClientProps {
  service: Service;
  heroImage: string;
  category: string;
}

const categoryContent = {
  'website-maintenance': {
    tagline: '🛡️ Reliable Website Care',
    title: 'Keep Your Website Running Smoothly',
    subtitle: "Focus on your business while we handle the technical stuff. From security updates to performance optimization, we have got your website covered 24/7.",
    problems: [
      "Your website is slow and losing visitors before they even see your content",
      "You're constantly worried about security threats and hackers",
      "Plugin updates break your site and you don't know how to fix it",
      "You're too busy running your business to deal with technical issues",
    ],
    whyUsTitle: 'Your Website Deserves Expert Care',
    whyUsDescription: "Think of us as your website personal IT team. We monitor, update, and optimize so you never have to worry about downtime, security threats, or outdated software.",
    benefits: [
      { icon: Shield, title: 'Proactive Security', description: 'We monitor and protect your site from threats before they become problems.' },
      { icon: Clock, title: '24/7 Monitoring', description: 'Round-the-clock uptime monitoring ensures your site is always accessible.' },
      { icon: TrendingUp, title: 'Performance Optimization', description: 'Regular speed checks and optimizations keep your site fast and user-friendly.' },
      { icon: Users, title: 'Priority Support', description: 'Get help when you need it with our dedicated support team.' },
    ],
    testimonial: {
      quote: "Since CDM Suite took over our website maintenance, we haven't had a single issue. Our site is faster, more secure, and we can finally focus on growing our business.",
      author: "Sarah Johnson",
      role: "CEO, Local Boutique",
      rating: 5,
    },
  },
  'website-creation': {
    tagline: '🚀 Launch Your Digital Presence',
    title: 'Beautiful Websites That Convert',
    subtitle: "Your website is often the first impression customers have of your business. Let us make it count with a stunning, high-performing site that turns visitors into customers.",
    problems: [
      "Your current website looks outdated and unprofessional, scaring away potential customers",
      "Visitors leave within seconds because your site is slow or confusing",
      "You're losing sales to competitors with better-looking, modern websites",
      "Your website doesn't work well on mobile devices, costing you half your traffic",
    ],
    whyUsTitle: 'More Than Just Pretty Pixels',
    whyUsDescription: "We do not just build websites; we craft digital experiences that align with your brand and business goals. Every element is designed with your target audience and conversion goals in mind.",
    benefits: [
      { icon: Target, title: 'Conversion-Focused Design', description: 'Every element is strategically placed to guide visitors toward taking action.' },
      { icon: TrendingUp, title: 'SEO-Ready Structure', description: 'Built from the ground up with search engines in mind for better visibility.' },
      { icon: Zap, title: 'Lightning-Fast Performance', description: 'Optimized code and hosting ensure your site loads in seconds, not minutes.' },
      { icon: Shield, title: 'Secure & Scalable', description: 'Enterprise-grade security and infrastructure that grows with your business.' },
    ],
    testimonial: {
      quote: "CDM Suite built us a website that's not just beautiful—it actually brings in customers. Our conversion rate tripled within the first two months!",
      author: "Michael Chen",
      role: "Founder, TechStart Inc",
      rating: 5,
    },
  },
  'seo': {
    tagline: '📈 Dominate Search Results',
    title: 'Get Found By Customers Searching For You',
    subtitle: "What is the point of a great website if nobody can find it? We help you climb the search rankings and attract qualified leads who are actively looking for what you offer.",
    problems: [
      "Your competitors are stealing customers because they rank higher on Google",
      "You're getting traffic, but it's the wrong people who never convert",
      "You've tried SEO before and got burned by shady 'guaranteed ranking' promises",
      "Your website is invisible in search results, leaving money on the table every single day",
    ],
    whyUsTitle: 'SEO That Actually Works',
    whyUsDescription: "Forget black-hat tricks and empty promises. We use proven, white-hat strategies that deliver sustainable, long-term growth in organic traffic and rankings.",
    benefits: [
      { icon: Target, title: 'Keyword Strategy', description: 'Target the right terms that your ideal customers are actually searching for.' },
      { icon: TrendingUp, title: 'Content Optimization', description: 'Create and optimize content that ranks well and converts visitors.' },
      { icon: BarChart3, title: 'Technical SEO', description: 'Fix the behind-the-scenes issues that hold your site back in search results.' },
      { icon: CheckCircle, title: 'Link Building', description: 'Earn high-quality backlinks that boost your authority and rankings.' },
    ],
    testimonial: {
      quote: "In 6 months, CDM Suite took us from page 3 to the top 3 results for our main keywords. Our organic leads have increased 400%!",
      author: "Jennifer Martinez",
      role: "Marketing Director, EcoHome Solutions",
      rating: 5,
    },
  },
  'social-media': {
    tagline: '💬 Build Your Social Empire',
    title: 'Turn Followers Into Customers',
    subtitle: "Social media is not just about likes and shares, it is about building relationships and driving real business results. Let us create content that connects and converts.",
    problems: [
      "You're posting regularly but nobody's engaging with your content",
      "Your followers aren't turning into paying customers",
      "You're wasting hours creating content that falls flat",
      "Your competitors have thriving social communities while yours feels like a ghost town",
    ],
    whyUsTitle: 'Strategic Social Media That Sells',
    whyUsDescription: "We go beyond posting pretty pictures. Our data-driven approach ensures every post, story, and campaign is aligned with your business goals and designed to engage your target audience.",
    benefits: [
      { icon: Target, title: 'Content Strategy', description: 'Tailored content calendars that resonate with your audience and drive engagement.' },
      { icon: Users, title: 'Community Management', description: 'Build relationships and loyalty through genuine engagement and timely responses.' },
      { icon: BarChart3, title: 'Analytics & Insights', description: 'Track what works and optimize your strategy based on real data.' },
      { icon: TrendingUp, title: 'Paid Social Campaigns', description: 'Amplify your reach with targeted ads that deliver measurable ROI.' },
    ],
    testimonial: {
      quote: "Our social media was dead before CDM Suite. Now we're getting daily leads and our engagement is through the roof!",
      author: "David Thompson",
      role: "Owner, Fitness First Gym",
      rating: 5,
    },
  },
  'ad-management': {
    tagline: '💰 Results-Driven Advertising',
    title: 'Turn Ad Spend Into Revenue',
    subtitle: "Stop wasting money on ads that don't work. We create, manage, and optimize campaigns that deliver real, measurable returns on your investment.",
    problems: [
      "You're burning through thousands in ad spend with little to show for it",
      "Your ads get clicks but nobody's actually buying",
      "You have no idea which ads are working and which are wasting money",
      "Managing multiple ad platforms is eating up all your time",
    ],
    whyUsTitle: 'More Than an Agency, We are Your Growth Team',
    whyUsDescription: "We do not just run ads, we become an extension of your team, obsessed with one goal: maximizing your return on ad spend through constant testing and optimization.",
    benefits: [
      { icon: Target, title: 'Multi-Platform Expertise', description: 'From Google to Meta to TikTok, we speak every platform language fluently.' },
      { icon: TrendingUp, title: 'ROAS-Focused', description: 'We optimize for revenue, not vanity metrics like clicks and impressions.' },
      { icon: BarChart3, title: 'Transparent Reporting', description: 'See exactly where your money goes and what results it generates.' },
      { icon: Zap, title: 'Continuous Optimization', description: 'Daily monitoring and tweaking to squeeze every dollar of value from your budget.' },
    ],
    testimonial: {
      quote: "We were getting a 2x ROAS before CDM Suite. Now we're consistently hitting 5-6x. They've literally transformed our business.",
      author: "Amanda Rodriguez",
      role: "CEO, Bella Fashion Boutique",
      rating: 5,
    },
  },
  'app-creation': {
    tagline: '📱 Bring Your App Idea to Life',
    title: 'Custom Mobile Apps That Users Love',
    subtitle: "Transform your vision into a powerful mobile app that delights users and drives business growth. From concept to launch, we are with you every step of the way.",
    problems: [
      "Your app idea is stuck in your head because you don't know where to start",
      "You've been burned by developers who overpromised and underdelivered",
      "You're worried about building something users won't actually use",
      "Your competitors have apps while you're still stuck with just a website",
    ],
    whyUsTitle: 'Apps Built for Success',
    whyUsDescription: "We combine technical excellence with user-centered design to create apps that people actually want to use. Whether iOS, Android, or both, we deliver polished products that exceed expectations.",
    benefits: [
      { icon: Users, title: 'User-Centric Design', description: 'Beautiful, intuitive interfaces that users love and understand instantly.' },
      { icon: Zap, title: 'Native Performance', description: 'Fast, responsive apps that take full advantage of each platform capabilities.' },
      { icon: Shield, title: 'Secure & Reliable', description: 'Enterprise-grade security and infrastructure for peace of mind.' },
      { icon: TrendingUp, title: 'Scalable Architecture', description: 'Built to grow with your user base without breaking a sweat.' },
    ],
    testimonial: {
      quote: "From concept to launch in 4 months. CDM Suite built us an app that our customers love and keeps them coming back. Worth every penny!",
      author: "Robert Kim",
      role: "Founder, FitLife Pro",
      rating: 5,
    },
  },
  'app-maintenance': {
    tagline: '🔧 Keep Your App Running Perfectly',
    title: 'App Maintenance You Can Count On',
    subtitle: "Your app is live, great! Now let us keep it that way. We handle updates, bug fixes, and optimizations so your users always have the best experience.",
    problems: [
      "Your app crashes and users are leaving 1-star reviews",
      "You're losing users because your app doesn't work with the latest OS updates",
      "Bug fixes take forever and your users are getting frustrated",
      "Your app feels outdated compared to competitors",
    ],
    whyUsTitle: 'Peace of Mind for Your Mobile App',
    whyUsDescription: "Apps need constant care to stay compatible with new OS versions, fix bugs, and meet user expectations. We provide the ongoing support that keeps your app healthy and your users happy.",
    benefits: [
      { icon: Shield, title: 'OS Compatibility', description: 'Stay current with the latest iOS and Android updates without disruption.' },
      { icon: Clock, title: 'Quick Bug Fixes', description: 'Rapid response to issues that affect user experience and ratings.' },
      { icon: TrendingUp, title: 'Performance Monitoring', description: 'Proactive tracking to catch and fix problems before users notice them.' },
      { icon: Zap, title: 'Feature Enhancements', description: 'Regular improvements to keep your app competitive and engaging.' },
    ],
    testimonial: {
      quote: "Our app rating went from 3.2 to 4.8 stars after CDM Suite took over maintenance. They're incredibly responsive and proactive!",
      author: "Lisa Anderson",
      role: "Product Manager, ShopLocal App",
      rating: 5,
    },
  },
  'bundle': {
    tagline: '🎁 Complete Digital Solutions',
    title: 'Everything You Need to Succeed Online',
    subtitle: "Why piece together multiple vendors when you can get everything in one package? Our bundles combine our most powerful services for maximum impact at a better value.",
    problems: [
      "You're juggling multiple agencies and nothing works together",
      "Your marketing budget is stretched thin across different vendors",
      "You're spending more time managing vendors than growing your business",
      "Your digital presence feels disconnected and unprofessional",
    ],
    whyUsTitle: 'The Complete Package',
    whyUsDescription: "Bundles are not just about saving money, they are about synergy. When we handle your website, SEO, ads, and social media together, each piece works better and you get faster results.",
    benefits: [
      { icon: Target, title: 'Integrated Strategy', description: 'All your digital marketing working together toward common goals.' },
      { icon: TrendingUp, title: 'Better ROI', description: 'Save money while getting better results from coordinated campaigns.' },
      { icon: Users, title: 'Single Point of Contact', description: 'One team handling everything means better communication and faster execution.' },
      { icon: CheckCircle, title: 'Faster Results', description: 'Coordinated efforts across channels accelerate your growth timeline.' },
    ],
    testimonial: {
      quote: "Switching to CDM Suite's bundle package was the best decision we made. Everything works together now and we're growing faster than ever!",
      author: "Marcus Williams",
      role: "CEO, Urban Eats",
      rating: 5,
    },
  },
  'general': {
    tagline: '🎯 Professional Digital Services',
    title: 'Elevate Your Digital Presence',
    subtitle: "Let us work together to take your digital presence to the next level with expert strategy and execution.",
    problems: [
      "Your digital marketing feels scattered and ineffective",
      "You're not sure where to invest your marketing budget",
      "You're overwhelmed by all the options and don't know where to start",
      "Your competitors are growing while you're stuck in place",
    ],
    whyUsTitle: 'Why Choose CDM Suite',
    whyUsDescription: "We combine technical expertise with strategic thinking to deliver solutions that drive real business results.",
    benefits: [
      { icon: Target, title: 'Strategic Approach', description: 'Data-driven strategies tailored to your unique goals and audience.' },
      { icon: TrendingUp, title: 'Proven Results', description: 'Track record of delivering measurable growth for our clients.' },
      { icon: Users, title: 'Dedicated Support', description: 'Responsive team that treats your success as our own.' },
      { icon: Shield, title: 'Quality Guarantee', description: 'We stand behind our work with ongoing support and optimization.' },
    ],
    testimonial: {
      quote: "CDM Suite doesn't just execute—they think strategically about our business and help us make smart decisions. True partners!",
      author: "Emily Parker",
      role: "Director of Marketing, TechVision",
      rating: 5,
    },
  },
};

export default function ServicePageClient({ service, heroImage, category }: ServicePageClientProps) {
  const [showScheduler, setShowScheduler] = useState(false);
  const content = useMemo(() => 
    categoryContent[category as keyof typeof categoryContent] || categoryContent.general,
    [category]
  );

  const handleScheduleClick = () => {
    setShowScheduler(true);
    setTimeout(() => {
      document.getElementById('ctaSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Get all tiers for the service category - memoized for performance
  const allTiers = useMemo(() => {
    switch (category) {
      case 'website-creation':
        return WEB_DEVELOPMENT_TIERS;
      case 'website-maintenance':
        return WEBSITE_MAINTENANCE_TIERS;
      case 'app-creation':
        return APP_CREATION_TIERS;
      case 'app-maintenance':
        return APP_MAINTENANCE_TIERS;
      case 'seo':
        return SEO_TIERS;
      case 'social-media':
        return SOCIAL_MEDIA_TIERS;
      case 'ad-management':
        return AD_MANAGEMENT_TIERS;
      default:
        return [];
    }
  }, [category]);

  return (
    <>
      <Navigation />
      
      {/* Hero Section with Header Image - Optimized & Compact */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <Image
              src={heroImage}
              alt={`${service.name} service`}
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
              quality={75}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900/80"></div>
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-20 z-10">
          <header className="text-center max-w-3xl mx-auto">
            <div className="inline-block bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-3 py-1.5 mb-4">
              <span className="text-primary font-semibold text-sm">{content.tagline}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
              {content.title}
            </h1>
            <p className="text-base md:text-lg text-gray-200 mb-6 leading-relaxed">
              {content.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <CheckoutButton 
                serviceId={service.id}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-full transition-transform duration-300 transform hover:scale-105"
              />
              <Button 
                onClick={handleScheduleClick}
                size="lg" 
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-gray-900 font-bold py-3 px-6 rounded-full"
              >
                Schedule a Call
              </Button>
            </div>
          </header>
        </div>
      </div>

      {/* Main Content - Compact & Optimized */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 pb-8 md:pb-12">
          
          {/* Featured Service Card - Compact */}
          <section className="relative z-10 -mt-16 max-w-4xl mx-auto mb-8 md:mb-12 bg-white p-6 md:p-8 rounded-2xl shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{service.name}</h2>
              <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4"></div>
              <p className="text-gray-600 text-base">{service.description}</p>
            </div>

            {/* Price Display - Compact */}
            <div className="text-center mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                ${service.price.toLocaleString()}
                {service.slug.includes('maintenance') || service.slug.includes('social-media') || service.slug.includes('ad-management') || service.slug.includes('seo') ? (
                  <span className="text-base text-gray-600 font-normal">/month</span>
                ) : (
                  <span className="text-base text-gray-600 font-normal"> starting</span>
                )}
              </div>
              {service.popular && (
                <div className="mt-2 inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
            </div>

            {/* Features List - Compact */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">What's Included</h3>
              <ul className="space-y-2">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button - Compact */}
            <div className="text-center">
              <CheckoutButton 
                serviceId={service.id}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-full transition-transform duration-300 transform hover:scale-105 w-full sm:w-auto"
              />
              <p className="mt-3 text-xs text-gray-500">
                🔒 Secure payment processing • 💯 Satisfaction guaranteed
              </p>
            </div>
          </section>

          {/* Problem Agitation Section - Russell Brunson Method */}
          {content.problems && content.problems.length > 0 && (
            <section className="max-w-4xl mx-auto mb-8 md:mb-12 bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-red-500 p-6 md:p-8 rounded-r-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Sound Familiar?
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Many business owners struggle with these exact same challenges:
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {content.problems.map((problem, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold">
                      ✗
                    </span>
                    <span className="text-gray-800 font-medium">{problem}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-white rounded-lg border-2 border-primary">
                <p className="text-gray-900 font-semibold text-center">
                  <span className="text-primary">Good news:</span> There's a better way. Let us show you how. 👇
                </p>
              </div>
            </section>
          )}

          {/* All Pricing Tiers Section - Compact & Optimized */}
          {allTiers.length > 0 && (
            <section id="pricing" className="mb-10 md:mb-14">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {category === 'website-creation' && 'Website Design Packages'}
                  {category === 'website-maintenance' && 'Website Maintenance Plans'}
                  {category === 'app-creation' && 'App Development Packages'}
                  {category === 'app-maintenance' && 'App Maintenance Plans'}
                  {category === 'seo' && 'SEO Service Plans'}
                  {category === 'social-media' && 'Social Media Management Packages'}
                  {category === 'ad-management' && 'Ad Management Plans'}
                  {!['website-creation', 'website-maintenance', 'app-creation', 'app-maintenance', 'seo', 'social-media', 'ad-management'].includes(category) && 'Our Pricing Options'}
                </h2>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Choose the package that best fits your needs
                </p>
              </div>
              
              <div className={`grid gap-4 max-w-6xl mx-auto ${allTiers.length === 3 ? 'md:grid-cols-3' : allTiers.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'}`}>
                {allTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`bg-white rounded-xl shadow-lg p-4 ${
                      tier.popular ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {tier.popular && (
                      <div className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-3">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-xs min-h-[36px]">
                      {tier.description}
                    </p>
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          ${tier.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {category.includes('maintenance') || category === 'seo' || category === 'social-media' || category === 'ad-management' ? '/month' : 'starting'}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-1.5 mb-4 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle className="text-primary flex-shrink-0 mt-0.5 h-3.5 w-3.5" />
                          <span className="text-gray-700 text-xs leading-tight">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={handleScheduleClick}
                      size="sm"
                      className={`w-full ${tier.popular ? 'bg-primary hover:bg-primary/90' : 'bg-gray-900 hover:bg-gray-800'} text-white text-xs py-2`}
                    >
                      Get Started
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Why Choose Us Section - Compact */}
          <section className="max-w-4xl mx-auto mb-8 md:mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {content.whyUsTitle}
              </h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                {content.whyUsDescription}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {content.benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-gray-800 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Social Proof / Testimonial Section - Russell Brunson Method */}
          {content.testimonial && (
            <section className="max-w-4xl mx-auto mb-8 md:mb-12 bg-gradient-to-br from-primary/5 to-primary/10 p-6 md:p-8 rounded-2xl border-2 border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Award className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">Real Results from Real Clients</h2>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-1 mb-4 justify-center">
                  {[...Array(content.testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <blockquote className="text-center mb-6">
                  <p className="text-lg text-gray-700 italic leading-relaxed">
                    "{content.testimonial.quote}"
                  </p>
                </blockquote>
                
                <div className="text-center border-t pt-4">
                  <p className="font-semibold text-gray-900">{content.testimonial.author}</p>
                  <p className="text-sm text-gray-600">{content.testimonial.role}</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-700 font-medium">
                  Join hundreds of satisfied clients who've transformed their business with CDM Suite
                </p>
              </div>
            </section>
          )}

          {/* Quality Commitment Section */}
          <section className="max-w-4xl mx-auto mb-8 md:mb-12">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Our 100% Satisfaction Commitment
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We're so confident you'll love working with us that we offer a complete satisfaction commitment. 
                    If you're not thrilled with our work, we'll continue working with you until you are completely satisfied with the results.
                  </p>
                  <p className="text-gray-900 font-semibold">
                    Your success is our success. We're committed to delivering exceptional results. 🎯
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Value Stack Section - Russell Brunson Method */}
          <section className="max-w-4xl mx-auto mb-8 md:mb-12">
            <div className="bg-white border-2 border-primary rounded-2xl p-6 md:p-8">
              <div className="text-center mb-6">
                <Badge className="bg-primary text-white px-4 py-1 text-sm mb-2">LIMITED TIME BONUS</Badge>
                <h3 className="text-2xl font-bold text-gray-900">
                  What You Get When You Start Today
                </h3>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Core Service Package</span>
                    <span className="text-gray-600 block text-sm">Everything listed in your selected tier</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Gift className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">FREE Strategy Session ($500 value)</span>
                    <span className="text-gray-600 block text-sm">60-minute deep-dive with our experts</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Gift className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">FREE Website Audit ($300 value)</span>
                    <span className="text-gray-600 block text-sm">Comprehensive analysis of your current digital presence</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Gift className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Priority Support Access</span>
                    <span className="text-gray-600 block text-sm">Get answers fast with our dedicated support team</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t-2 border-dashed border-gray-300 pt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Total Value: <span className="line-through">$800+</span></p>
                <p className="text-2xl font-bold text-primary">Yours FREE when you start today!</p>
              </div>
            </div>
          </section>

          {/* Urgency Section with CTA - Russell Brunson Method */}
          <section className="max-w-3xl mx-auto mb-8 md:mb-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-1">
            <div className="bg-white rounded-xl p-6 md:p-8">
              <div className="text-center mb-4">
                <Badge className="bg-red-500 text-white px-4 py-1 text-sm mb-3 animate-pulse">⚡ LIMITED SPOTS AVAILABLE</Badge>
                <p className="text-lg text-gray-700 font-semibold">
                  We only take on a limited number of clients each month to ensure the highest quality service.
                </p>
                <p className="text-primary font-bold text-xl mt-2">
                  Only 3 spots remaining this month!
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action Section - Russell Brunson Style */}
          <section id="ctaSection" className="text-center mt-10 md:mt-14 max-w-3xl mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-1 shadow-2xl">
            <div className="bg-white rounded-xl p-6 md:p-8">
              {!showScheduler ? (
                <div id="ctaContent">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <ArrowRight className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    It's Decision Time
                  </h2>
                  <p className="text-gray-700 mb-2 text-lg leading-relaxed font-medium">
                    You have two choices right now:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left max-w-xl mx-auto">
                    <p className="text-gray-600 mb-2"><span className="text-red-500 font-bold">❌ Choice 1:</span> Keep struggling with the same problems, watching your competitors get ahead while you waste time and money on solutions that don't work.</p>
                    <p className="text-gray-900 font-semibold"><span className="text-green-600 font-bold">✅ Choice 2:</span> Take action today, get expert help, and finally see the results you deserve with our proven system and satisfaction guarantee.</p>
                  </div>
                  <p className="text-gray-900 mb-6 text-lg leading-relaxed font-semibold">
                    The choice is yours. But remember—every day you wait is a day your competitors are getting ahead.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                    <CheckoutButton 
                      serviceId={service.id}
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    />
                    <Button 
                      onClick={handleScheduleClick}
                      size="lg"
                      variant="outline"
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-4 px-8 rounded-full text-lg"
                    >
                      Talk to an Expert First
                    </Button>
                  </div>
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 inline-block">
                    <p className="text-green-900 font-bold flex items-center gap-2 justify-center">
                      <Shield className="h-5 w-5" />
                      Backed by our 100% Satisfaction Commitment
                    </p>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    ⏱️ Start seeing results in 30 days or less • 🎁 $800+ in FREE bonuses • 🔒 Quality guaranteed
                  </p>
                </div>
              ) : (
                <div id="scheduler">
                  <CalendlyScheduler url="https://calendly.com/cdm-creativemedia/digital-marketing-power-session" />
                </div>
              )}
            </div>
          </section>

          {/* FAQ Section - Compact */}
          <section className="max-w-3xl mx-auto mt-10 md:mt-14 border-t pt-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-base text-gray-800 mb-1 flex items-start gap-2">
                  <span className="text-primary">Q:</span>
                  How long does it take to get started?
                </h3>
                <p className="text-gray-600 pl-6 text-sm">
                  We can typically kick things off within 1-2 business days of purchase. For larger projects, we will schedule an onboarding call to ensure we understand your goals and gather any necessary information.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-base text-gray-800 mb-1 flex items-start gap-2">
                  <span className="text-primary">Q:</span>
                  What if I need something custom?
                </h3>
                <p className="text-gray-600 pl-6 text-sm">
                  No problem! While our packages cover most needs, we are always happy to create a custom solution tailored to your specific requirements. Just schedule a call with us to discuss your needs.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-base text-gray-800 mb-1 flex items-start gap-2">
                  <span className="text-primary">Q:</span>
                  Can I upgrade or downgrade later?
                </h3>
                <p className="text-gray-600 pl-6 text-sm">
                  Absolutely! Your needs may change as your business grows, and we are flexible. You can adjust your service level anytime, just reach out to your account manager or our support team.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}
