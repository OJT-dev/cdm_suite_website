
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, X, Wand2 } from "lucide-react";
import toast from "react-hot-toast";

interface SectionEditorProps {
  bidId: string;
  section: "envelope1Content" | "envelope2Content" | "envelope1Notes" | "envelope2Notes" | "generalProposalComment";
  initialContent: string;
  label: string;
  placeholder?: string;
  onSave?: () => void;
}

export function SectionEditor({
  bidId,
  section,
  initialContent,
  label,
  placeholder,
  onSave,
}: SectionEditorProps) {
  const [content, setContent] = useState(initialContent || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/bid-proposals/${bidId}/update-section`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to save section");
      }

      toast.success("Section saved successfully");
      setIsEditing(false);
      onSave?.();
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error("Failed to save section");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/bid-proposals/${bidId}/regenerate-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section }),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate section");
      }

      const data = await response.json();
      setContent(data.content || "");
      toast.success("Section regenerated successfully");
      onSave?.();
    } catch (error) {
      console.error("Error regenerating section:", error);
      toast.error("Failed to regenerate section");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent || "");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{label}</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Regenerate with AI
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="prose max-w-none rounded-lg border bg-muted/30 p-4">
          <div className="whitespace-pre-wrap">{content || "No content yet"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{label}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
        className="min-h-[400px] font-mono text-sm"
      />
      <p className="text-sm text-muted-foreground">
        {content.length.toLocaleString()} characters
      </p>
    </div>
  );
}
