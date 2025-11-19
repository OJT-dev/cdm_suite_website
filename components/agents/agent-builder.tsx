
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Sparkles, FileText, Link as LinkIcon, Zap } from "lucide-react";
import { toast } from "react-hot-toast";

const AGENT_TYPES = [
  { value: "customer-support", label: "Customer Support", description: "24/7 support bot to answer common questions" },
  { value: "lead-gen", label: "Lead Generation", description: "Qualify and capture leads automatically" },
  { value: "appointment-booking", label: "Appointment Booking", description: "Schedule meetings and appointments" },
  { value: "sales-assistant", label: "Sales Assistant", description: "Help customers make purchase decisions" },
  { value: "faq-bot", label: "FAQ Bot", description: "Answer frequently asked questions" },
];

const PERSONALITIES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "technical", label: "Technical" },
  { value: "sales", label: "Sales-Oriented" },
];

const TONES = [
  { value: "helpful", label: "Helpful" },
  { value: "direct", label: "Direct" },
  { value: "empathetic", label: "Empathetic" },
  { value: "persuasive", label: "Persuasive" },
];

export function AgentBuilder({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    agentType: "",
    personality: "professional",
    tone: "helpful",
    industry: "",
    welcomeMessage: "Hi! How can I help you today?",
    systemPrompt: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    // Validation
    if (!formData.name || !formData.agentType) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create agent");
      }

      const data = await response.json();
      toast.success("Agent created successfully!");
      router.push(`/dashboard/ai-agents/${data.agent.id}`);
    } catch (error: any) {
      console.error("Error creating agent:", error);
      toast.error(error.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          Create AI Agent
        </h1>
        <p className="text-muted-foreground mt-2">
          Build a custom AI agent to automate your business
        </p>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basics">
              <Bot className="w-4 h-4 mr-2" />
              Basics
            </TabsTrigger>
            <TabsTrigger value="personality">
              <Sparkles className="w-4 h-4 mr-2" />
              Personality
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Zap className="w-4 h-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Basics Tab */}
          <TabsContent value="basics" className="space-y-6">
            <div>
              <Label htmlFor="name">Agent Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Customer Support Bot"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="What does this agent do?"
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="agentType">Agent Type *</Label>
              <Select
                value={formData.agentType}
                onValueChange={(value) => handleInputChange("agentType", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry">Industry (Optional)</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange("industry", e.target.value)}
                placeholder="e.g., Real Estate, E-commerce, Healthcare"
                className="mt-2"
              />
            </div>
          </TabsContent>

          {/* Personality Tab */}
          <TabsContent value="personality" className="space-y-6">
            <div>
              <Label htmlFor="personality">Personality</Label>
              <Select
                value={formData.personality}
                onValueChange={(value) => handleInputChange("personality", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERSONALITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={formData.tone}
                onValueChange={(value) => handleInputChange("tone", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Input
                id="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={(e) => handleInputChange("welcomeMessage", e.target.value)}
                placeholder="First message visitors see"
                className="mt-2"
              />
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div>
              <Label htmlFor="systemPrompt">Custom System Prompt (Optional)</Label>
              <Textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) => handleInputChange("systemPrompt", e.target.value)}
                placeholder="Advanced: Custom instructions for the AI (leave blank for auto-generated)"
                className="mt-2"
                rows={6}
              />
              <p className="text-sm text-muted-foreground mt-2">
                If left blank, we'll generate optimal instructions based on your selections
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Agent"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
