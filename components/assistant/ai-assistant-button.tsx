
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Sparkles } from "lucide-react";
import { AIAssistantChat } from "./ai-assistant-chat";
import { cn } from "@/lib/utils";

interface AIAssistantButtonProps {
  user: any;
}

export function AIAssistantButton({ user }: AIAssistantButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Only show the AI assistant on dashboard pages
  const shouldShow = pathname?.startsWith('/dashboard');
  
  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-12 w-12 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-110"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)]">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Assistant</h3>
                  <p className="text-xs text-blue-100">
                    {user.tier === "free"
                      ? `${10 - (user.dailyMessageCount || 0)} free messages today`
                      : "Unlimited messages"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Chat content */}
            <AIAssistantChat user={user} />
          </div>
        </div>
      )}
    </>
  );
}
