
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage?: string;
}

interface SeoPanelProps {
  projectId: string;
  pageSlug: string;
  pageTitle: string;
  initialSeo?: SeoData;
  onUpdate: (seoData: SeoData) => void;
}

export function SeoPanel({ 
  projectId, 
  pageSlug, 
  pageTitle,
  initialSeo, 
  onUpdate 
}: SeoPanelProps) {
  const [seoData, setSeoData] = useState<SeoData>({
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    ogImage: "",
    ...initialSeo,
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (initialSeo) {
      setSeoData({ ...seoData, ...initialSeo });
    }
  }, [initialSeo]);

  const handleChange = (field: keyof SeoData, value: string) => {
    setSeoData({ ...seoData, [field]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/builder/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, pageSlug, seoData }),
      });

      if (!response.ok) throw new Error("Failed to save SEO settings");

      toast.success("SEO settings updated successfully!");
      setHasChanges(false);
      onUpdate(seoData);
    } catch (error) {
      console.error("Save SEO error:", error);
      toast.error("Failed to save SEO settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSeoData(initialSeo || {
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      ogImage: "",
    });
    setHasChanges(false);
  };

  const handleGenerateWithAI = async () => {
    setGenerating(true);
    try {
      // This would call an AI endpoint to generate SEO content
      // For now, we'll create intelligent defaults based on page title
      const generatedSeo = {
        metaTitle: `${pageTitle} | Your Business Name`,
        metaDescription: `Learn more about ${pageTitle.toLowerCase()} and how we can help you achieve your goals. Get started today!`,
        keywords: pageTitle.toLowerCase().split(" ").join(", "),
      };
      
      setSeoData({ ...seoData, ...generatedSeo });
      setHasChanges(true);
      toast.success("AI-generated SEO content!");
    } catch (error) {
      console.error("Generate SEO error:", error);
      toast.error("Failed to generate SEO content");
    } finally {
      setGenerating(false);
    }
  };

  const titleLength = seoData.metaTitle.length;
  const descriptionLength = seoData.metaDescription.length;
  const titleStatus = titleLength === 0 ? "empty" : titleLength > 60 ? "too-long" : "good";
  const descriptionStatus = descriptionLength === 0 ? "empty" : descriptionLength > 160 ? "too-long" : "good";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SEO Settings</h3>
          <p className="text-sm text-muted-foreground">
            Optimize {pageTitle} for search engines
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateWithAI}
            disabled={generating}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? "Generating..." : "Generate with AI"}
          </Button>
          {hasChanges && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        {/* Meta Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Meta Title</Label>
            <div className="flex items-center gap-2">
              <Badge 
                variant={titleStatus === "good" ? "default" : titleStatus === "too-long" ? "destructive" : "secondary"}
              >
                {titleLength}/60
              </Badge>
              {titleStatus === "too-long" && (
                <span className="text-xs text-destructive">Too long</span>
              )}
            </div>
          </div>
          <Input
            value={seoData.metaTitle}
            onChange={(e) => handleChange("metaTitle", e.target.value)}
            placeholder="Your page title for search results"
            maxLength={80}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Recommended: 50-60 characters
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Meta Description</Label>
            <div className="flex items-center gap-2">
              <Badge 
                variant={descriptionStatus === "good" ? "default" : descriptionStatus === "too-long" ? "destructive" : "secondary"}
              >
                {descriptionLength}/160
              </Badge>
              {descriptionStatus === "too-long" && (
                <span className="text-xs text-destructive">Too long</span>
              )}
            </div>
          </div>
          <Textarea
            value={seoData.metaDescription}
            onChange={(e) => handleChange("metaDescription", e.target.value)}
            placeholder="A brief description that appears in search results"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Recommended: 150-160 characters
          </p>
        </div>

        {/* Keywords */}
        <div>
          <Label>Keywords (comma-separated)</Label>
          <Input
            value={seoData.keywords}
            onChange={(e) => handleChange("keywords", e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Add 3-5 relevant keywords for this page
          </p>
        </div>

        {/* Open Graph Image */}
        <div>
          <Label>Social Media Share Image (Open Graph)</Label>
          {seoData.ogImage ? (
            <div className="mt-2 relative">
              <img 
                src={seoData.ogImage} 
                alt="OG Image" 
                className="w-full h-40 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleChange("ogImage", "")}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload an image for social media sharing
              </p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: 1200x630px
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Preview */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Search Result Preview</h4>
        <div className="space-y-1">
          <div className="text-blue-600 text-lg hover:underline">
            {seoData.metaTitle || "Your Page Title"}
          </div>
          <div className="text-green-700 text-sm">
            https://yourdomain.com/{pageSlug}
          </div>
          <div className="text-gray-600 text-sm">
            {seoData.metaDescription || "Your page description will appear here..."}
          </div>
        </div>
      </Card>
    </div>
  );
}
