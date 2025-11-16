
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, TrendingUp, Search, Share2, Smartphone, Globe, Star, Wrench } from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  AD_MANAGEMENT_TIERS, 
  SEO_TIERS, 
  SOCIAL_MEDIA_TIERS, 
  WEB_DEVELOPMENT_TIERS,
  APP_CREATION_TIERS,
  WEBSITE_MAINTENANCE_TIERS,
  APP_MAINTENANCE_TIERS
} from "@/lib/pricing-tiers";

interface User {
  id: string;
  email: string;
  name: string | null;
  tier: string;
}

interface ServicesClientProps {
  user: User;
}

const services = {
  adManagement: AD_MANAGEMENT_TIERS,
  seo: SEO_TIERS,
  socialMedia: SOCIAL_MEDIA_TIERS,
  webDevelopment: WEB_DEVELOPMENT_TIERS,
  appCreation: APP_CREATION_TIERS,
  websiteMaintenance: WEBSITE_MAINTENANCE_TIERS,
  appMaintenance: APP_MAINTENANCE_TIERS,
};

export default function ServicesClient({ user }: ServicesClientProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (serviceId: string, serviceName: string, price: number) => {
    setLoading(serviceId);
    
    try {
      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          serviceName,
          price,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  const renderServiceCard = (service: any, category: string) => (
    <Card key={service.id} className={`relative ${service.popular ? 'border-primary shadow-lg' : ''}`}>
      {service.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-white">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{service.name}</CardTitle>
        <CardDescription>{service.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-primary">${service.price.toLocaleString()}</span>
          <span className="text-gray-600">/month</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {service.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full"
          variant={service.popular ? "default" : "outline"}
          onClick={() => handlePurchase(service.id, `${category} - ${service.name}`, service.price)}
          disabled={loading === service.id}
        >
          {loading === service.id ? "Processing..." : "Purchase Now"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Our Services</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Choose from our comprehensive digital marketing services to grow your business
        </p>
      </div>

      <Tabs defaultValue="ad-management" className="w-full">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-1">
            <TabsTrigger value="ad-management" className="whitespace-nowrap">
              <TrendingUp className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Ad Management</span>
              <span className="sm:hidden ml-1">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="whitespace-nowrap">
              <Search className="w-4 h-4 sm:mr-2" />
              <span className="ml-1">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="social-media" className="whitespace-nowrap">
              <Share2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Social Media</span>
              <span className="sm:hidden ml-1">Social</span>
            </TabsTrigger>
            <TabsTrigger value="web-development" className="whitespace-nowrap">
              <Globe className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Web Dev</span>
              <span className="sm:hidden ml-1">Web</span>
            </TabsTrigger>
            <TabsTrigger value="app-creation" className="whitespace-nowrap">
              <Smartphone className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">App Creation</span>
              <span className="sm:hidden ml-1">Apps</span>
            </TabsTrigger>
            <TabsTrigger value="website-maintenance" className="whitespace-nowrap">
              <Wrench className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Web Maintenance</span>
              <span className="sm:hidden ml-1">Web Maint</span>
            </TabsTrigger>
            <TabsTrigger value="app-maintenance" className="whitespace-nowrap">
              <Wrench className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">App Maintenance</span>
              <span className="sm:hidden ml-1">App Maint</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ad-management" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Advertising Management</h2>
            <p className="text-gray-600">
              Turn ad spend into revenue with our expert campaign management
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.adManagement.map((service) => renderServiceCard(service, "Ad Management"))}
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">SEO Services</h2>
            <p className="text-gray-600">
              Get found by customers searching for your products and services
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.seo.map((service) => renderServiceCard(service, "SEO"))}
          </div>
        </TabsContent>

        <TabsContent value="social-media" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Social Media Marketing</h2>
            <p className="text-gray-600">
              Build your brand and engage your audience on social platforms
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.socialMedia.map((service) => renderServiceCard(service, "Social Media"))}
          </div>
        </TabsContent>

        <TabsContent value="web-development" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Web Development</h2>
            <p className="text-gray-600">
              Beautiful, high-performing websites that convert visitors into customers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.webDevelopment.map((service) => renderServiceCard(service, "Web Development"))}
          </div>
        </TabsContent>

        <TabsContent value="app-creation" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">App Creation</h2>
            <p className="text-gray-600">
              Transform your vision into a powerful mobile app that users love
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.appCreation.map((service) => renderServiceCard(service, "App Creation"))}
          </div>
        </TabsContent>

        <TabsContent value="website-maintenance" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Website Maintenance</h2>
            <p className="text-gray-600">
              Keep your website secure, updated, and running smoothly 24/7
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.websiteMaintenance.map((service) => renderServiceCard(service, "Website Maintenance"))}
          </div>
        </TabsContent>

        <TabsContent value="app-maintenance" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">App Maintenance</h2>
            <p className="text-gray-600">
              Ongoing support to keep your mobile app updated and performing at its best
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.appMaintenance.map((service) => renderServiceCard(service, "App Maintenance"))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Need Help Choosing?</CardTitle>
          <CardDescription>
            Not sure which service is right for you? Our team is here to help!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/contact'}>
            Schedule a Free Consultation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
