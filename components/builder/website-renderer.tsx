
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  ShoppingCart,
  Search,
  User,
} from "lucide-react";
import { useState } from "react";
import * as LucideIcons from "lucide-react";

interface WebsiteRendererProps {
  page: any;
  pages: any[];
  siteConfig: any;
  subdomain: string;
  navigationConfig?: any;
  globalStyles?: any;
}

export function WebsiteRenderer({
  page,
  pages,
  siteConfig,
  subdomain,
  navigationConfig,
  globalStyles,
}: WebsiteRendererProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  
  // Use global styles if available, fallback to site config
  const colors = globalStyles?.colors || siteConfig.colors || {
    primary: "#1E3A8A",
    secondary: "#3B82F6",
    accent: "#F59E0B",
  };

  // Check if this is an ecommerce site
  const isEcommerce = pages.some((p: any) => 
    p.slug === "shop" || p.slug === "products" || p.slug === "store"
  );

  // Get icon component dynamically
  const getIcon = (iconName: string) => {
    const icons = LucideIcons as any;
    const IconComponent = icons[iconName] || icons.Circle;
    return IconComponent;
  };

  // Helper function to format slug into a navigation label as fallback
  const formatSlugToNavLabel = (slug: string): string => {
    // Map common slugs to standard nav labels
    const standardLabels: Record<string, string> = {
      'home': 'Home',
      'about': 'About',
      'about-us': 'About',
      'services': 'Services',
      'our-services': 'Services',
      'products': 'Products',
      'shop': 'Shop',
      'store': 'Store',
      'portfolio': 'Portfolio',
      'work': 'Work',
      'projects': 'Projects',
      'our-work': 'Work',
      'team': 'Team',
      'our-team': 'Team',
      'blog': 'Blog',
      'news': 'News',
      'resources': 'Resources',
      'contact': 'Contact',
      'contact-us': 'Contact',
      'get-in-touch': 'Contact',
      'pricing': 'Pricing',
      'features': 'Features',
      'testimonials': 'Reviews',
      'case-studies': 'Case Studies',
      'gallery': 'Gallery'
    };

    // Return standard label if exists
    if (standardLabels[slug]) {
      return standardLabels[slug];
    }

    // Otherwise, capitalize first letter of each word
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get navigation icon for a page
  const getNavigationIcon = (slug: string) => {
    if (!navigationConfig?.icons || !navigationConfig.icons[slug]) {
      return null;
    }
    return getIcon(navigationConfig.icons[slug]);
  };

  // Filter and order pages for navigation
  const getNavigationPages = () => {
    let navPages = [...pages];

    // Filter out hidden pages
    if (navigationConfig?.hiddenPages) {
      navPages = navPages.filter((p: any) => !navigationConfig.hiddenPages.includes(p.slug));
    }

    // Reorder pages if custom order is specified
    if (navigationConfig?.pageOrder) {
      navPages.sort((a: any, b: any) => {
        const aIndex = navigationConfig.pageOrder.indexOf(a.slug);
        const bIndex = navigationConfig.pageOrder.indexOf(b.slug);
        
        // If both are in custom order, use that order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        // If only one is in custom order, prioritize it
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        // Otherwise maintain original order
        return 0;
      });
    }

    return navPages;
  };

  const navigationPages = getNavigationPages();

  // Handle contact form submission
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      message: formData.get('message') as string,
      subdomain,
      pageSlug: page.slug,
    };

    try {
      const response = await fetch('/api/builder/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setFormSuccess(true);
        (e.target as HTMLFormElement).reset();
        
        // Reset success message after 5 seconds
        setTimeout(() => setFormSuccess(false), 5000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-white z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={`/site/${subdomain}`} className="flex items-center">
              <h1 className="text-xl font-bold" style={{ color: colors.primary }}>
                {siteConfig.siteName}
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationPages.map((p: any) => {
                const NavIcon = getNavigationIcon(p.slug);
                return (
                  <Link
                    key={p.slug}
                    href={`/site/${subdomain}?page=${p.slug}`}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                      p.slug === page.slug ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {NavIcon && <NavIcon className="w-4 h-4" />}
                    {p.customNavLabel || p.navLabel || formatSlugToNavLabel(p.slug)}
                  </Link>
                );
              })}
            </div>

            {/* Right side icons */}
            <div className="hidden md:flex items-center space-x-4">
              {isEcommerce && (
                <>
                  <Button variant="ghost" size="icon">
                    <Search className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      0
                    </span>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {navigationPages.map((p: any) => {
                const NavIcon = getNavigationIcon(p.slug);
                return (
                  <Link
                    key={p.slug}
                    href={`/site/${subdomain}?page=${p.slug}`}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${
                      p.slug === page.slug
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {NavIcon && <NavIcon className="w-4 h-4" />}
                    {p.customNavLabel || p.navLabel || formatSlugToNavLabel(p.slug)}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      {page.hero && (
        <section
          className="relative py-20 px-4 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.secondary}20 50%, ${colors.accent}10 100%)`,
          }}
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: colors.primary }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: colors.secondary }} />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div 
                  className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-2"
                  style={{ 
                    backgroundColor: `${colors.primary}15`,
                    color: colors.primary
                  }}
                >
                  ✨ {siteConfig.tagline || "Welcome"}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {page.hero.headline}
                </h1>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  {page.hero.subheadline}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  {page.hero.cta && (
                    <Button
                      size="lg"
                      style={{ backgroundColor: colors.primary }}
                      className="text-white hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl px-8 py-6 text-base"
                    >
                      {page.hero.cta} →
                    </Button>
                  )}
                  {page.hero.ctaSecondary && (
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="px-8 py-6 text-base hover:bg-gray-50"
                      style={{ borderColor: colors.primary, color: colors.primary }}
                    >
                      {page.hero.ctaSecondary}
                    </Button>
                  )}
                </div>
              </div>
              {page.hero.image && (
                <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group">
                  <div 
                    className="absolute inset-0 rounded-2xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
                      opacity: 0,
                      transition: 'opacity 0.3s'
                    }}
                  />
                  <Image
                    src={page.hero.image}
                    alt={page.hero.imageDescription || "Hero image"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Page Sections */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
        {page.sections?.map((section: any, idx: number) => (
          <section key={idx} className="space-y-8">
            {/* Section Header */}
            {section.title && (
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">{section.title}</h2>
                {section.subtitle && (
                  <p className="text-lg text-gray-600">{section.subtitle}</p>
                )}
              </div>
            )}

            {/* Section Content */}
            {section.content && (
              <div
                className="prose max-w-4xl mx-auto"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}

            {/* Section Items */}
            {section.items && section.items.length > 0 && (
              <div>
                {/* Services/Features Grid */}
                {(section.type === "services" ||
                  section.type === "features" ||
                  section.type === "benefits") && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {section.items.map((item: any, itemIdx: number) => {
                      const IconComponent = getIcon(
                        item.icon || "Circle"
                      );
                      return (
                        <Card 
                          key={itemIdx} 
                          className="p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-t-4 group"
                          style={{ borderTopColor: colors.primary }}
                        >
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                            style={{ 
                              background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}30 100%)` 
                            }}
                          >
                            <IconComponent
                              className="w-7 h-7"
                              style={{ color: colors.primary }}
                            />
                          </div>
                          <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>{item.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{item.description}</p>
                          {item.image && (
                            <div className="relative h-48 mt-4 rounded-lg overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Portfolio/Work Grid */}
                {(section.type === "portfolio" || section.type === "work") && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.items.map((item: any, itemIdx: number) => (
                      <Card key={itemIdx} className="overflow-hidden hover:shadow-xl transition-shadow group">
                        {item.image && (
                          <div className="relative h-64 overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Team Grid */}
                {section.type === "team" && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {section.items.map((item: any, itemIdx: number) => (
                      <Card key={itemIdx} className="text-center p-6">
                        {item.image ? (
                          <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Testimonials */}
                {section.type === "testimonials" && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.items.map((item: any, itemIdx: number) => (
                      <Card key={itemIdx} className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          {item.image ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <User className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold">{item.title}</h4>
                            {item.subtitle && (
                              <p className="text-sm text-gray-500">{item.subtitle}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 italic">&ldquo;{item.description}&rdquo;</p>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Stats */}
                {section.type === "stats" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {section.items.map((item: any, itemIdx: number) => {
                      const IconComponent = getIcon(item.icon || "TrendingUp");
                      return (
                        <div key={itemIdx} className="text-center">
                          <IconComponent
                            className="w-8 h-8 mx-auto mb-2"
                            style={{ color: colors.primary }}
                          />
                          <div
                            className="text-3xl md:text-4xl font-bold mb-2"
                            style={{ color: colors.primary }}
                          >
                            {item.description}
                          </div>
                          <div className="text-gray-600">{item.title}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Process/Steps */}
                {section.type === "process" && (
                  <div className="space-y-6">
                    {section.items.map((item: any, itemIdx: number) => {
                      const IconComponent = getIcon(item.icon || "CheckCircle");
                      return (
                        <div key={itemIdx} className="flex gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: colors.primary, color: "white" }}
                          >
                            {itemIdx + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* FAQ */}
                {section.type === "faq" && (
                  <div className="max-w-3xl mx-auto space-y-4">
                    {section.items.map((item: any, itemIdx: number) => (
                      <Card key={itemIdx} className="p-6">
                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Products/Ecommerce */}
                {(section.type === "products" || section.type === "shop") && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {section.items.map((item: any, itemIdx: number) => (
                      <Card key={itemIdx} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {item.image && (
                          <div className="relative h-64 overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-bold mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          {item.price && (
                            <div className="flex items-center justify-between">
                              <span
                                className="text-xl font-bold"
                                style={{ color: colors.primary }}
                              >
                                ${item.price}
                              </span>
                              <Button
                                size="sm"
                                style={{ backgroundColor: colors.primary }}
                                className="text-white"
                              >
                                Add to Cart
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Pricing */}
                {section.type === "pricing" && (
                  <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {section.items.map((item: any, itemIdx: number) => (
                      <Card
                        key={itemIdx}
                        className={`p-8 ${
                          item.popular
                            ? "border-2 shadow-xl"
                            : ""
                        }`}
                        style={
                          item.popular
                            ? { borderColor: colors.primary }
                            : undefined
                        }
                      >
                        {item.popular && (
                          <div
                            className="text-center text-sm font-bold px-3 py-1 rounded-full mb-4"
                            style={{
                              backgroundColor: `${colors.primary}20`,
                              color: colors.primary,
                            }}
                          >
                            Most Popular
                          </div>
                        )}
                        <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                        <div className="mb-4">
                          <span
                            className="text-4xl font-bold"
                            style={{ color: colors.primary }}
                          >
                            ${item.price}
                          </span>
                          {item.period && (
                            <span className="text-gray-600">/{item.period}</span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-6">{item.description}</p>
                        {item.features && (
                          <ul className="space-y-3 mb-6">
                            {item.features.map((feature: any, fIdx: number) => {
                              // Handle both string and object formats
                              const featureText = typeof feature === 'string' ? feature : feature?.text || feature?.title || String(feature);
                              const featureIcon = typeof feature === 'object' ? feature?.icon : null;
                              const FeatureIcon = featureIcon ? getIcon(featureIcon) : null;
                              
                              return (
                                <li key={fIdx} className="flex items-start gap-2">
                                  {FeatureIcon ? (
                                    <FeatureIcon
                                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                                      style={{ color: colors.primary }}
                                    />
                                  ) : (
                                    <svg
                                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                                      style={{ color: colors.primary }}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                  <span className="text-sm">{featureText}</span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        <Button
                          className="w-full"
                          style={
                            item.popular
                              ? { backgroundColor: colors.primary, color: "white" }
                              : undefined
                          }
                          variant={item.popular ? "default" : "outline"}
                        >
                          Get Started
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section Image */}
            {section.image && section.imagePlacement !== "background" && (
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={section.image}
                  alt={section.imageDescription || section.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </section>
        ))}

        {/* Contact Form Section (if page has contact form) */}
        {(page.slug === 'contact' || page.slug === 'contact-us') && (
          <section className="max-w-3xl mx-auto">
            <Card className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              {formSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <p className="font-semibold">Thank you for your message!</p>
                  <p className="text-sm mt-1">We'll get back to you soon.</p>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-2">
                      Company
                    </label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Company name"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Tell us about your project or question..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full"
                  style={{ backgroundColor: colors.primary }}
                >
                  {formSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{siteConfig.siteName}</h3>
              <p className="text-gray-400 text-sm">{siteConfig.tagline}</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {pages.slice(0, 5).map((p: any) => (
                  <li key={p.slug}>
                    <Link
                      href={`/site/${subdomain}?page=${p.slug}`}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {siteConfig.contact?.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {siteConfig.contact.email}
                  </li>
                )}
                {siteConfig.contact?.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {siteConfig.contact.phone}
                  </li>
                )}
                {siteConfig.contact?.address && (
                  <li className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {siteConfig.contact.address}
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Business Hours</h4>
              <p className="text-sm text-gray-400">
                {siteConfig.contact?.hours || "Monday-Friday: 9am-5pm"}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {siteConfig.siteName}. All rights reserved.</p>
            <p className="mt-2">
              Built with{" "}
              <a
                href="https://cdmsuite.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                CDM Suite
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Shopify Integration Notice (if ecommerce) */}
      {isEcommerce && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm">
          <p className="text-sm text-yellow-800">
            <strong>E-commerce Integration:</strong> This is a demo. To enable real shopping cart
            functionality, connect your Shopify store in the dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
