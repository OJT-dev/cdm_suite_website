
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Wand2, Sparkles, Type, Zap, CheckCircle2, 
  ChevronRight, Loader2 
} from "lucide-react";
import { toast } from "sonner";

interface ContentContextMenuProps {
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
  onReplace: (newText: string) => void;
}

const IMPROVEMENT_ACTIONS = [
  { id: "shorter", label: "Make Shorter", icon: Zap },
  { id: "professional", label: "More Professional", icon: Type },
  { id: "casual", label: "Make Casual", icon: Sparkles },
  { id: "formal", label: "Make Formal", icon: CheckCircle2 },
  { id: "expand", label: "Expand", icon: ChevronRight },
  { id: "fix-grammar", label: "Fix Grammar", icon: CheckCircle2 },
];

export function ContentContextMenu({
  selectedText,
  position,
  onClose,
  onReplace,
}: ContentContextMenuProps) {
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    if (!selectedText.trim()) {
      toast.error("Please select some text first");
      return;
    }

    setLoading(true);
    setActiveAction(action);

    try {
      const response = await fetch("/api/builder/improve-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: selectedText,
          action,
          context: {},
        }),
      });

      if (!response.ok) throw new Error("Failed to improve content");

      const data = await response.json();
      onReplace(data.improved);
      toast.success("Content improved!");
      onClose();
    } catch (error) {
      console.error("Content improvement error:", error);
      toast.error("Failed to improve content");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  return (
    <Card
      className="absolute z-50 shadow-xl border-2 p-2 min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center gap-2 px-2 py-1 mb-2 border-b">
        <Wand2 className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-semibold">Improve with AI</span>
      </div>

      <div className="space-y-1">
        {IMPROVEMENT_ACTIONS.map((action) => {
          const Icon = action.icon;
          const isActive = activeAction === action.id;

          return (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => handleAction(action.id)}
              disabled={loading}
            >
              {isActive && loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Icon className="w-4 h-4 mr-2" />
              )}
              {action.label}
            </Button>
          );
        })}
      </div>

      <div className="border-t mt-2 pt-2 px-2">
        <p className="text-xs text-muted-foreground">
          Select text in the editor and choose an action
        </p>
      </div>
    </Card>
  );
}
