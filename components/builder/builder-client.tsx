
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { MessageSquare, FormInput, Layout, Sparkles } from "lucide-react";
import { AIChat } from "./ai-chat";
import { BusinessForm } from "./business-form";
import { TemplateGallery } from "./template-gallery";
import { BuilderProgress } from "./builder-progress";

interface BuilderClientProps {
  user: any;
  auditData?: any;
}

export function BuilderClient({ user, auditData }: BuilderClientProps) {
  const [showDemo, setShowDemo] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState<any>(
    auditData
      ? {
          existingWebsite: auditData.websiteUrl,
          auditId: auditData.id,
        }
      : {}
  );
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "completed">("idle");
  const [generatedProject, setGeneratedProject] = useState<any>(null);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setActiveTab("form");
  };

  const handleStartCustomization = () => {
    setShowDemo(false);
    setSelectedTemplate("modern-business");
    setActiveTab("form");
  };

  const handleBusinessDataUpdate = (data: any) => {
    setBusinessData({ ...businessData, ...data });
  };

  const handleGenerate = async (data: any) => {
    if (!selectedTemplate) {
      alert("Please select a template first");
      return;
    }

    setGenerationStatus("generating");

    try {
      const response = await fetch("/api/builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          templateId: selectedTemplate,
          auditId: businessData.auditId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle insufficient credits error
        if (response.status === 402 && errorData.needsCredits) {
          const shouldBuyCredits = confirm(
            errorData.message + "\n\nWould you like to purchase more credits or upgrade your plan?"
          );
          
          if (shouldBuyCredits) {
            window.location.href = "/dashboard/billing?credits=true";
          }
          
          setGenerationStatus("idle");
          return;
        }
        
        throw new Error(errorData.message || "Generation failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let partialRead = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        partialRead += decoder.decode(value, { stream: true });
        let lines = partialRead.split("\n");
        partialRead = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.status === "completed") {
                setGenerationStatus("completed");
                setGeneratedProject(parsed.result);
                return;
              } else if (parsed.status === "error") {
                throw new Error(parsed.message || "Generation failed");
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate website. Please try again.");
      setGenerationStatus("idle");
    }
  };

  if (generationStatus === "generating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <BuilderProgress />
        </div>
      </div>
    );
  }

  // Demo/Sample view - shown first
  if (showDemo && !auditData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">AI Website Builder</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Build Your Professional Website in Minutes
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Create a stunning, SEO-optimized website powered by AI. No coding required.
            </p>
            
            {/* Pricing Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-md border-2 border-blue-200 mb-8">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="text-2xl font-bold text-blue-600">$340 - $500</p>
              </div>
              <div className="h-10 w-px bg-gray-300" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Or use</p>
                <p className="text-lg font-bold">1 Credit</p>
              </div>
            </div>
          </div>

          {/* Video Walkthrough */}
          <Card className="p-8 mb-8 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">See How It Works</h2>
              <p className="text-muted-foreground">Watch a quick demo of the AI Website Builder in action</p>
            </div>
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              <div className="relative z-10 text-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-colors cursor-pointer">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <p className="font-semibold text-lg">Watch 2-Minute Demo</p>
                <p className="text-sm text-gray-300 mt-1">Learn how to create your website with AI</p>
              </div>
            </div>
          </Card>

          {/* Interactive Template Preview */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Choose From Professional Templates</h2>
              <p className="text-muted-foreground">All templates are fully customizable and optimized for your industry</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {[
                { 
                  name: "Business", 
                  color: "from-blue-500 to-blue-600",
                  icon: "🏢",
                  features: ["Corporate design", "Service pages", "Team profiles"]
                },
                { 
                  name: "Creative", 
                  color: "from-purple-500 to-pink-500",
                  icon: "🎨",
                  features: ["Portfolio grid", "Case studies", "Bold design"]
                },
                { 
                  name: "E-commerce", 
                  color: "from-red-500 to-orange-500",
                  icon: "🛍️",
                  features: ["Product catalog", "Shopping cart", "Checkout"]
                }
              ].map((template, idx) => (
                <Card key={idx} className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group">
                  <div className={`h-48 bg-gradient-to-br ${template.color} flex items-center justify-center relative`}>
                    <div className="text-6xl group-hover:scale-110 transition-transform">{template.icon}</div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      Popular
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">{template.name}</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {template.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Main CTA */}
          <Card className="p-8 mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your Website?</h2>
            <p className="text-lg mb-6 text-blue-50">
              Join hundreds of businesses who've launched their websites with our AI Builder
            </p>
            <button
              onClick={handleStartCustomization}
              className="px-10 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Building Now →
            </button>
            <p className="text-sm text-blue-100 mt-4">
              First website free • Takes less than 5 minutes • No credit card required
            </p>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered Design</h3>
              <p className="text-sm text-muted-foreground">
                Our AI creates beautiful, modern designs specifically tailored for your business and industry
              </p>
            </Card>
            <Card className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FormInput className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Easy Customization</h3>
              <p className="text-sm text-muted-foreground">
                Simply answer a few questions about your business and watch your website come to life
              </p>
            </Card>
            <Card className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Launch in Minutes</h3>
              <p className="text-sm text-muted-foreground">
                Go from idea to live website in under 10 minutes. No technical skills required
              </p>
            </Card>
          </div>

          {/* What's Included */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-lg">✨ What's Included:</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Professional Design:</strong> Mobile-responsive, modern layouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>SEO Optimized:</strong> Built-in SEO best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Lead Capture:</strong> Contact forms & lead generation tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Custom Domain:</strong> Connect your own domain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>SSL Security:</strong> Free SSL certificate included</span>
                </li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-lg">🚀 Perfect For:</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span><strong>Small Businesses:</strong> Get online fast with professional presence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span><strong>Startups:</strong> Launch your MVP website quickly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span><strong>Freelancers:</strong> Showcase your portfolio professionally</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span><strong>Service Providers:</strong> Generate leads & bookings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span><strong>E-commerce:</strong> Start selling products online</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (generationStatus === "completed" && generatedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Your Website is Ready! 🎉</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We've generated your professional website. View it live or continue editing.
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8 inline-block">
              <p className="text-sm text-muted-foreground mb-2">Your website URL:</p>
              <a
                href={`https://${generatedProject.subdomain}.cdmsuite.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-mono text-blue-600 hover:underline"
              >
                {generatedProject.subdomain}.cdmsuite.com
              </a>
            </div>

            <div className="flex gap-4 justify-center">
              <a
                href={`/builder/preview/${generatedProject.projectId}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Preview Website
              </a>
              <a
                href={`/builder/editor/${generatedProject.projectId}`}
                className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                Edit Website
              </a>
              <a
                href="/dashboard"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Go to Dashboard
              </a>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">AI Website Builder</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Build Your Website in Minutes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {auditData
              ? "Based on your audit, we'll help you rebuild a better website"
              : "Choose a template, tell us about your business, and let AI create your perfect website"}
          </p>
        </div>

        {/* Builder Tabs */}
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="form" className="flex items-center gap-2" disabled={!selectedTemplate}>
                <FormInput className="w-4 h-4" />
                Business Info
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2" disabled={!selectedTemplate}>
                <MessageSquare className="w-4 h-4" />
                AI Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              <TemplateGallery
                onSelect={handleTemplateSelect}
                selectedTemplate={selectedTemplate}
              />
            </TabsContent>

            <TabsContent value="form">
              <BusinessForm
                templateId={selectedTemplate}
                initialData={businessData}
                onGenerate={handleGenerate}
                auditData={auditData}
              />
            </TabsContent>

            <TabsContent value="chat">
              <AIChat
                businessData={businessData}
                onDataUpdate={handleBusinessDataUpdate}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
