
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { WEBSITE_TEMPLATES } from "@/lib/builder/templates";
import { Check, Sparkles } from "lucide-react";
import Image from "next/image";

interface TemplateGalleryProps {
  onSelect: (templateId: string) => void;
  selectedTemplate: string | null;
}

export function TemplateGallery({ onSelect, selectedTemplate }: TemplateGalleryProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Template</h2>
        <p className="text-muted-foreground">
          Select a professionally designed template that matches your industry
        </p>
        <p className="text-sm text-blue-600 mt-2 font-medium">
          All templates include 5-15 pages • Fully responsive • SEO optimized
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WEBSITE_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={`relative overflow-hidden cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? "ring-4 ring-blue-600 shadow-2xl scale-105"
                : "hover:ring-2 hover:ring-blue-400 hover:shadow-xl"
            }`}
            onClick={() => onSelect(template.id)}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            {/* Selection indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-4 right-4 z-10 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
            )}

            {/* Template thumbnail with interactive preview */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-full h-full transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${template.colors.primary}${hoveredTemplate === template.id ? '44' : '22'} 0%, ${template.colors.secondary}${hoveredTemplate === template.id ? '44' : '22'} 100%)`,
                  }}
                />
                
                {/* Animated browser mockup */}
                <div className="absolute inset-0 p-6 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Browser chrome */}
                    <div className="h-6 bg-gray-200 flex items-center gap-1.5 px-3">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                    </div>
                    
                    {/* Page content mockup */}
                    <div className="p-3 space-y-2 bg-white">
                      <div 
                        className="h-8 rounded transition-all duration-300"
                        style={{ 
                          backgroundColor: hoveredTemplate === template.id ? template.colors.primary : template.colors.primary + '40',
                          width: '80%'
                        }}
                      />
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-200 rounded" style={{ width: '90%' }} />
                        <div className="h-2 bg-gray-200 rounded" style={{ width: '70%' }} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {[1, 2, 3].map((i) => (
                          <div 
                            key={i} 
                            className="h-8 rounded transition-all duration-200"
                            style={{ backgroundColor: template.colors.secondary + '30' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hover overlay */}
              {hoveredTemplate === template.id && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-sm">
                    Click to Select
                  </div>
                </div>
              )}
            </div>

            {/* Template details */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{template.name}</h3>
                <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>

              {/* Pages included */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  PAGES INCLUDED ({template.pages.length}):
                </p>
                <p className="text-xs text-gray-600">
                  {template.pages.join(", ")}
                </p>
              </div>

              {/* Features */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  KEY FEATURES:
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-muted rounded-md flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-green-600" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ideal for */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  PERFECT FOR:
                </p>
                <p className="text-xs text-gray-600">
                  {template.ideal_for.slice(0, 2).join(" • ")}
                </p>
              </div>

              {/* Color palette */}
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-muted-foreground">COLORS:</p>
                <div className="flex gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm"
                    style={{ backgroundColor: template.colors.primary }}
                    title="Primary"
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm"
                    style={{ backgroundColor: template.colors.secondary }}
                    title="Secondary"
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm"
                    style={{ backgroundColor: template.colors.accent }}
                    title="Accent"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Selection CTA */}
      {selectedTemplate && (
        <div className="sticky bottom-8 left-0 right-0 flex justify-center z-20">
          <Card className="p-4 bg-blue-600 text-white shadow-2xl">
            <div className="flex items-center gap-4">
              <Check className="w-6 h-6" />
              <div>
                <p className="font-semibold">
                  Template Selected: {WEBSITE_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                </p>
                <p className="text-sm text-blue-100">
                  Click "Business Info" tab above to continue
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
