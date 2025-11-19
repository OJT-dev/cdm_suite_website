
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";

export function AgentSettingsTab({ agent }: { agent: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: agent.name,
    description: agent.description || "",
    personality: agent.personality,
    tone: agent.tone,
    welcomeMessage: agent.welcomeMessage,
    widgetColor: agent.widgetColor,
    widgetPosition: agent.widgetPosition,
    status: agent.status,
    isPublic: agent.isPublic,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update agent");
      
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating agent:", error);
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <Label htmlFor="name">Agent Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-2"
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="personality">Personality</Label>
          <Select
            value={formData.personality}
            onValueChange={(value) => setFormData(prev => ({ ...prev, personality: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="sales">Sales-Oriented</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tone">Tone</Label>
          <Select
            value={formData.tone}
            onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="helpful">Helpful</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="empathetic">Empathetic</SelectItem>
              <SelectItem value="persuasive">Persuasive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="welcomeMessage">Welcome Message</Label>
        <Input
          id="welcomeMessage"
          value={formData.welcomeMessage}
          onChange={(e) => setFormData(prev => ({ ...prev, welcomeMessage: e.target.value }))}
          className="mt-2"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="widgetColor">Widget Color</Label>
          <Input
            id="widgetColor"
            type="color"
            value={formData.widgetColor}
            onChange={(e) => setFormData(prev => ({ ...prev, widgetColor: e.target.value }))}
            className="mt-2 h-10"
          />
        </div>

        <div>
          <Label htmlFor="widgetPosition">Widget Position</Label>
          <Select
            value={formData.widgetPosition}
            onValueChange={(value) => setFormData(prev => ({ ...prev, widgetPosition: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom-right">Bottom Right</SelectItem>
              <SelectItem value="bottom-left">Bottom Left</SelectItem>
              <SelectItem value="top-right">Top Right</SelectItem>
              <SelectItem value="top-left">Top Left</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <p className="font-medium">Show in Public Gallery</p>
          <p className="text-sm text-muted-foreground">
            Display this agent in the public gallery for social proof
          </p>
        </div>
        <Switch
          checked={formData.isPublic}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
        />
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
