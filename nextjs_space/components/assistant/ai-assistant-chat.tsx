
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantChatProps {
  user: any;
}

export function AIAssistantChat({ user }: AIAssistantChatProps) {
  const isFreeTier = user.tier === "free";
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi ${user.name?.split(" ")[0] || "there"}! 👋 I'm your AI business assistant. I can help you build websites, create marketing strategies, analyze your performance, and grow your business. What would you like to work on today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(
    isFreeTier ? 10 - (user.dailyMessageCount || 0) : null
  );
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || limitReached) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Check if daily limit reached
        if (response.status === 403 && error.message?.includes("daily limit")) {
          setLimitReached(true);
          setMessagesRemaining(0);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: error.message,
            },
          ]);
          return;
        }
        
        throw new Error(error.error || "Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Add empty assistant message to start streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content") {
                assistantMessage += parsed.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content =
                    assistantMessage;
                  return newMessages;
                });
              } else if (parsed.type === "done") {
                setConversationId(parsed.conversationId);
                // Update remaining messages for free tier
                if (parsed.remaining !== null && parsed.remaining !== undefined) {
                  setMessagesRemaining(parsed.remaining);
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.message || "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-2 max-w-[80%]",
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-900 rounded-bl-none"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        {limitReached ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">
                  Daily limit reached
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  You've used all 10 free messages today. Come back tomorrow or upgrade for unlimited access!
                </p>
              </div>
            </div>
            <Link href="/dashboard/upgrade">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade for Unlimited AI Assistant
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="mt-2 text-center">
              {isFreeTier ? (
                <p className="text-xs text-muted-foreground">
                  {messagesRemaining !== null && messagesRemaining > 0 ? (
                    <>
                      <span className="font-medium text-amber-600">
                        {messagesRemaining} free {messagesRemaining === 1 ? "message" : "messages"}
                      </span>{" "}
                      remaining today •{" "}
                      <Link
                        href="/dashboard/upgrade"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Upgrade for unlimited
                      </Link>
                    </>
                  ) : (
                    <>
                      10 free messages per day •{" "}
                      <Link
                        href="/dashboard/upgrade"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Upgrade for unlimited
                      </Link>
                    </>
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  ✨ Unlimited AI assistant • {user.credits} project credits remaining
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
