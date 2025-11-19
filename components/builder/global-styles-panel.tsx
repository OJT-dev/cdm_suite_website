
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Save, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface GlobalStylesPanelProps {
  projectId: string;
  initialStyles?: any;
  onUpdate: (styles: any) => void;
}

const WEB_SAFE_FONTS = [
  { value: "Inter", label: "Inter (Modern Sans-serif)" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia (Serif)" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New (Monospace)" },
  { value: "Verdana", label: "Verdana" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Palatino", label: "Palatino" },
  { value: "Garamond", label: "Garamond" },
];

export function GlobalStylesPanel({ 
  projectId, 
  initialStyles, 
  onUpdate 
}: GlobalStylesPanelProps) {
  const [styles, setStyles] = useState({
    colors: {
      primary: "#3B82F6",
      secondary: "#8B5CF6",
      accent: "#F59E0B",
      text: "#1F2937",
      background: "#FFFFFF",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    ...initialStyles,
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialStyles) {
      setStyles({ ...styles, ...initialStyles });
    }
  }, [initialStyles]);

  const handleColorChange = (colorKey: string, value: string) => {
    setStyles({
      ...styles,
      colors: {
        ...styles.colors,
        [colorKey]: value,
      },
    });
    setHasChanges(true);
  };

  const handleFontChange = (fontKey: string, value: string) => {
    setStyles({
      ...styles,
      fonts: {
        ...styles.fonts,
        [fontKey]: value,
      },
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/builder/global-styles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, globalStyles: styles }),
      });

      if (!response.ok) throw new Error("Failed to save styles");

      toast.success("Site styles updated successfully!");
      setHasChanges(false);
      onUpdate(styles);
    } catch (error) {
      console.error("Save styles error:", error);
      toast.error("Failed to save styles");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStyles(initialStyles || {
      colors: {
        primary: "#3B82F6",
        secondary: "#8B5CF6",
        accent: "#F59E0B",
        text: "#1F2937",
        background: "#FFFFFF",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
      },
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Site Styles
          </h3>
          <p className="text-sm text-muted-foreground">
            Customize your site's visual brand
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Colors Section */}
      <Card className="p-4">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Color Palette
        </h4>
        <div className="space-y-3">
          {Object.entries(styles.colors).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="capitalize">{key}</Label>
              </div>
              <input
                type="color"
                value={value as string}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="w-12 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={value as string}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="w-24 px-2 py-1 text-sm border rounded font-mono"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Fonts Section */}
      <Card className="p-4">
        <h4 className="font-semibold mb-4">Typography</h4>
        <div className="space-y-4">
          <div>
            <Label>Heading Font</Label>
            <Select
              value={styles.fonts.heading}
              onValueChange={(value) => handleFontChange("heading", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEB_SAFE_FONTS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Body Font</Label>
            <Select
              value={styles.fonts.body}
              onValueChange={(value) => handleFontChange("body", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEB_SAFE_FONTS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Style Preview</h4>
        <div 
          className="space-y-4 p-6 rounded-lg"
          style={{ 
            backgroundColor: styles.colors.background,
            color: styles.colors.text,
          }}
        >
          <h1 
            className="text-3xl font-bold"
            style={{ 
              fontFamily: styles.fonts.heading,
              color: styles.colors.primary,
            }}
          >
            Heading Example
          </h1>
          <p style={{ fontFamily: styles.fonts.body }}>
            This is how your body text will look on your website. The font and colors
            will be applied consistently across all pages.
          </p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: styles.colors.primary,
                color: "#FFFFFF",
              }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: styles.colors.secondary,
                color: "#FFFFFF",
              }}
            >
              Secondary Button
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: styles.colors.accent,
                color: "#FFFFFF",
              }}
            >
              Accent Button
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
