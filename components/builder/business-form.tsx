
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, AlertCircle, Wand2, Loader2 } from "lucide-react";
import { getTemplate } from "@/lib/builder/templates";

interface BusinessFormProps {
  templateId: string | null;
  initialData?: any;
  onGenerate: (data: any) => void;
  auditData?: any;
}

export function BusinessForm({
  templateId,
  initialData = {},
  onGenerate,
  auditData,
}: BusinessFormProps) {
  const [formData, setFormData] = useState({
    businessName: initialData.businessName || "",
    industry: initialData.industry || "",
    services: initialData.services || "",
    targetAudience: initialData.targetAudience || "",
    goals: initialData.goals || "",
    existingWebsite: initialData.existingWebsite || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  const template = templateId ? getTemplate(templateId) : null;

  const handleAiAutofill = async () => {
    if (!aiPrompt.trim()) return;

    setIsAutofilling(true);
    try {
      const response = await fetch("/api/assistant/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          formType: "business",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to autofill");
      }

      const data = await response.json();
      setFormData({
        businessName: data.businessName || formData.businessName,
        industry: data.industry || formData.industry,
        services: data.services || formData.services,
        targetAudience: data.targetAudience || formData.targetAudience,
        goals: data.goals || formData.goals,
        existingWebsite: formData.existingWebsite,
      });
      setShowAiInput(false);
      setAiPrompt("");
    } catch (error: any) {
      alert(error.message || "Failed to autofill form. Please try again.");
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Parse services and goals
    const services = formData.services
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s);
    const goals = formData.goals
      .split(",")
      .map((g: string) => g.trim())
      .filter((g: string) => g);

    await onGenerate({
      ...formData,
      services,
      goals,
    });

    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!template) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Please select a template first
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {auditData && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Building from Audit Data
              </h3>
              <p className="text-sm text-blue-700">
                We'll use insights from your website audit (Score: {auditData.overallScore}/100) to create 
                an improved version with better SEO, performance, and user experience.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* AI Autofill */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Wand2 className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 mb-1">
              ✨ Quick Start with AI
            </h3>
            <p className="text-sm text-purple-700 mb-3">
              Just describe your business in 3-4 words and let AI fill out the entire form for you!
            </p>
            
            {!showAiInput ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAiInput(true)}
                className="bg-white"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Use AI Autofill (2 credits)
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Digital marketing agency, Coffee shop Portland, Personal fitness trainer"
                  className="bg-white"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isAutofilling) {
                      handleAiAutofill();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAiAutofill}
                    disabled={!aiPrompt.trim() || isAutofilling}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isAutofilling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAiInput(false);
                      setAiPrompt("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Tell Us About Your Business</h2>
        <p className="text-muted-foreground">
          Provide details about your business so our AI can create tailored content for your{" "}
          <span className="font-semibold text-blue-600">{template.name}</span> website
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="e.g., Acme Digital Marketing"
            required
          />
        </div>

        <div>
          <Label htmlFor="industry">Industry *</Label>
          <Input
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="e.g., Digital Marketing, Web Design, Consulting"
            required
          />
        </div>

        <div>
          <Label htmlFor="services">
            Services or Products (comma-separated) *
          </Label>
          <Textarea
            id="services"
            name="services"
            value={formData.services}
            onChange={handleChange}
            placeholder="e.g., SEO, Social Media Marketing, Web Development, Branding"
            rows={3}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate each service with a comma
          </p>
        </div>

        <div>
          <Label htmlFor="targetAudience">Target Audience *</Label>
          <Input
            id="targetAudience"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleChange}
            placeholder="e.g., Small business owners, Startups, E-commerce brands"
            required
          />
        </div>

        <div>
          <Label htmlFor="goals">
            Business Goals (comma-separated) *
          </Label>
          <Textarea
            id="goals"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            placeholder="e.g., Generate leads, Increase brand awareness, Showcase portfolio"
            rows={3}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate each goal with a comma
          </p>
        </div>

        {!auditData && (
          <div>
            <Label htmlFor="existingWebsite">
              Existing Website (optional)
            </Label>
            <Input
              id="existingWebsite"
              name="existingWebsite"
              type="url"
              value={formData.existingWebsite}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              If you have an existing website, we'll use it as reference
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
            size="lg"
          >
            {isSubmitting ? (
              <>Generating...</>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate My Website
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Template Preview */}
      <Card className="mt-8 p-6 bg-muted/50">
        <h3 className="font-semibold mb-4">Selected Template: {template.name}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Pages included:</p>
            <p className="font-medium">{template.pages.join(", ")}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Key features:</p>
            <p className="font-medium">{template.features.slice(0, 2).join(", ")}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
