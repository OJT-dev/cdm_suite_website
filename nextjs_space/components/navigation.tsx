

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X, ChevronDown, Sparkles, User, LogIn, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Navigation = () => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { name: "About", href: "/about" },
    { name: "Free Tools", href: "/tools" },
    { name: "Case Studies", href: "/case-studies" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const galleryItems = [
    { name: "Website Gallery", href: "/gallery/websites", description: "Explore AI-built websites" },
    { name: "AI Agent Gallery", href: "/gallery/ai-agents", description: "Discover AI agents" },
  ];

  const serviceCategories = [
    {
      title: "Website Services",
      items: [
        { name: "Website Creation", href: "/services/website-creation-starter", description: "Build your online presence" },
        { name: "Website Maintenance", href: "/services/website-maintenance-basic", description: "Keep your site running smoothly" },
      ]
    },
    {
      title: "Marketing Services",
      items: [
        { name: "SEO Services", href: "/services/seo-local-basic", description: "Rank higher in search results" },
        { name: "Social Media", href: "/services/social-media-basic", description: "Grow your social presence" },
        { name: "Ad Management", href: "/services/ad-management-starter", description: "Maximize your ad ROI" },
      ]
    },
    {
      title: "App Services",
      items: [
        { name: "Mobile Apps", href: "/services/app-creation-mvp", description: "Build custom mobile solutions" },
        { name: "App Maintenance", href: "/services/app-maintenance-basic", description: "Keep your app updated" },
      ]
    },
    {
      title: "Bundle Packages",
      items: [
        { name: "Launch Package", href: "/services/bundle-launch", description: "Everything to get started" },
      ]
    }
  ];

  const serviceItems = [
    { name: "All Services & Pricing", href: "/pricing" },
    { name: "Website Maintenance", href: "/services/website-maintenance-basic" },
    { name: "Website Creation", href: "/services/website-creation-starter" },
    { name: "SEO Services", href: "/services/seo-local-basic" },
    { name: "Social Media", href: "/services/social-media-basic" },
    { name: "Ad Management", href: "/services/ad-management-starter" },
    { name: "Mobile Apps", href: "/services/app-creation-mvp" },
    { name: "App Maintenance", href: "/services/app-maintenance-basic" },
    { name: "Bundle Packages", href: "/services/bundle-launch" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-charcoal shadow-xl border-b border-secondary/30"
          : "bg-charcoal backdrop-blur-lg"
      )}
    >
      <div className="section-container">
        {/* Top Bar with Phone Number */}
        <div className="hidden xl:flex items-center justify-end py-3 border-b border-white/10">
          <a 
            href="tel:8622727623" 
            className="flex items-center gap-3 text-white/90 hover:text-accent transition-colors text-sm font-medium group"
          >
            <div className="p-1.5 rounded-full bg-gradient-to-r from-secondary to-accent group-hover:scale-110 transition-transform">
              <Phone className="w-3.5 h-3.5 text-charcoal" />
            </div>
            <span className="font-bold text-base text-accent">(862) 272-7623</span>
            <span className="text-white/60 ml-1">• Call us now for a free consultation</span>
          </a>
        </div>

        <nav className="flex items-center justify-between h-16 xl:h-[88px] gap-2 xl:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 xl:space-x-3 group flex-shrink-0">
            <div className="bg-gradient-to-br from-accent to-secondary text-charcoal px-3 xl:px-4 py-1.5 xl:py-2 rounded-xl font-bold text-lg xl:text-xl shadow-lg group-hover:shadow-accent/50 transition-all duration-300 btn-breathe">
              CDM
            </div>
            <span className="font-bold text-xl xl:text-2xl text-white group-hover:text-accent transition-colors duration-300">Suite</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-3 2xl:space-x-4 flex-grow justify-center">
            {/* Services Dropdown with Radix UI */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-3 2xl:px-4 py-2 text-sm 2xl:text-base text-white/90 hover:text-accent transition-colors duration-200 font-medium rounded-lg hover:bg-white/5 bg-transparent data-[state=open]:bg-white/5 data-[state=open]:text-accent">
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[700px] p-4">
                      {/* View All Services Header */}
                      <Link
                        href="/services"
                        className="block p-4 mb-2 rounded-lg bg-gradient-to-r from-secondary/10 to-accent/10 hover:from-secondary/20 hover:to-accent/20 transition-all group"
                      >
                        <div className="font-bold text-lg text-royal-blue group-hover:text-secondary mb-1">
                          View All Services & Pricing
                        </div>
                        <p className="text-sm text-gray-600">
                          Explore our complete range of digital services
                        </p>
                      </Link>
                      
                      {/* Service Categories Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {serviceCategories.map((category) => (
                          <div key={category.title} className="space-y-2">
                            <h4 className="font-semibold text-sm text-gray-900 px-2">
                              {category.title}
                            </h4>
                            <div className="space-y-1">
                              {category.items.map((item) => (
                                <NavigationMenuLink key={item.name} asChild>
                                  <Link
                                    href={item.href}
                                    className="block px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-secondary/10 hover:to-accent/10 transition-all group"
                                  >
                                    <div className="font-medium text-sm text-gray-700 group-hover:text-royal-blue">
                                      {item.name}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {item.description}
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Gallery Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-3 2xl:px-4 py-2 text-sm 2xl:text-base text-white/90 hover:text-accent transition-colors duration-200 font-medium rounded-lg hover:bg-white/5 bg-transparent data-[state=open]:bg-white/5 data-[state=open]:text-accent">
                    Gallery
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="space-y-2">
                        {galleryItems.map((item) => (
                          <NavigationMenuLink key={item.name} asChild>
                            <Link
                              href={item.href}
                              className="block px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-secondary/10 hover:to-accent/10 transition-all group"
                            >
                              <div className="font-medium text-base text-gray-700 group-hover:text-royal-blue">
                                {item.name}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 2xl:px-4 py-2 text-sm 2xl:text-base text-white/90 hover:text-accent hover:bg-white/5 transition-colors duration-200 font-medium rounded-lg whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}

            {/* Free Audit CTA */}
            <Link href="/auditor">
              <Button className="ml-2 2xl:ml-3 bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold shadow-lg hover:shadow-accent/50 transition-all duration-300 group btn-breathe px-4 2xl:px-5 text-sm 2xl:text-base">
                <Sparkles className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 mr-1.5 2xl:mr-2 group-hover:rotate-12 transition-transform float-animation" />
                Free Audit
              </Button>
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden xl:flex items-center space-x-2 2xl:space-x-3 flex-shrink-0">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-charcoal font-bold shadow-lg hover:shadow-accent/50 transition-all duration-300 btn-breathe px-4 2xl:px-5 text-sm 2xl:text-base">
                  <User className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 mr-1.5 2xl:mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button className="bg-white/5 hover:bg-white/10 text-white border-2 border-secondary/60 hover:border-accent font-semibold transition-all duration-300 px-4 2xl:px-5 text-sm 2xl:text-base">
                    <LogIn className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 mr-1.5 2xl:mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold shadow-lg hover:shadow-accent/50 transition-all duration-300 btn-breathe btn-glow px-4 2xl:px-5 text-sm 2xl:text-base whitespace-nowrap">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="xl:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white flex-shrink-0"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="xl:hidden bg-charcoal border-t border-white/10 py-6 animate-in slide-in-from-top duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col space-y-2">
              {/* Phone Number - Mobile */}
              <a
                href="tel:8622727623"
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-secondary to-accent text-charcoal font-bold rounded-lg mx-3 mb-3 shadow-lg hover:shadow-accent/50 transition-all"
              >
                <div className="p-1.5 rounded-full bg-charcoal/20">
                  <Phone className="w-4 h-4" />
                </div>
                <span>Call (862) 272-7623</span>
              </a>

              {/* Free Audit - Featured */}
              <Link
                href="/auditor"
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-accent to-secondary text-charcoal font-bold rounded-lg mx-3 mb-3 btn-breathe shadow-lg hover:shadow-accent/50 transition-all"
                onClick={() => setIsOpen(false)}
              >
                <Sparkles className="w-4 h-4 float-animation" />
                Free Website Audit
              </Link>

              {/* Services Mobile Dropdown */}
              <div className="px-3">
                <button 
                  onClick={() => setServicesOpen(!servicesOpen)}
                  aria-expanded={servicesOpen}
                  aria-controls="mobile-services-menu"
                  aria-label="Toggle services menu"
                  className="flex items-center justify-between w-full px-5 py-3.5 text-white/90 hover:text-accent hover:bg-white/5 rounded-lg transition-colors duration-200 font-medium"
                >
                  Services
                  <ChevronDown className={cn("h-4 w-4 transition-transform", servicesOpen && "rotate-180")} />
                </button>
                {servicesOpen && (
                  <div id="mobile-services-menu" className="ml-4 mt-2 space-y-1">
                    {serviceItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-5 py-3 text-white/80 hover:text-accent hover:bg-white/5 rounded-lg transition-colors duration-200"
                        onClick={() => {
                          setIsOpen(false);
                          setServicesOpen(false);
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-8 py-3.5 text-white/90 hover:text-accent hover:bg-white/5 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="flex flex-col space-y-3 pt-6 px-3 border-t border-white/10 mt-4">
                {isAuthenticated ? (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-charcoal font-bold shadow-lg btn-breathe py-6">
                      <User className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-white/5 hover:bg-white/10 text-white border-2 border-secondary/60 hover:border-accent font-semibold py-6">
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal font-bold shadow-lg btn-breathe btn-glow py-6">
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
