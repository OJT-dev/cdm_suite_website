
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Globe, Upload, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export function AgentKnowledgeTab({ agent }: { agent: any }) {
  const [knowledge, setKnowledge] = useState(agent.knowledgeSources || []);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("agentId", agent.id);

    try {
      const response = await fetch("/api/agents/knowledge/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      setKnowledge([...knowledge, ...data.sources]);
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const handleAddWebsite = async () => {
    const url = prompt("Enter website URL to train on:");
    if (!url) return;

    try {
      const response = await fetch("/api/agents/knowledge/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, websiteUrl: url }),
      });

      if (!response.ok) throw new Error("Failed to add website");
      
      const data = await response.json();
      setKnowledge([...knowledge, data.source]);
      toast.success("Website added for training");
    } catch (error) {
      console.error("Error adding website:", error);
      toast.error("Failed to add website");
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm("Delete this knowledge source?")) return;

    try {
      const response = await fetch(`/api/agents/knowledge/${sourceId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");
      
      setKnowledge(knowledge.filter((k: any) => k.id !== sourceId));
      toast.success("Knowledge source deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Training Data</h3>
        <p className="text-muted-foreground text-sm">
          Upload documents or connect websites to train your agent
        </p>
      </div>

      <div className="flex gap-4">
        <label>
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.csv,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button variant="outline" className="cursor-pointer" disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Documents"}
          </Button>
        </label>
        
        <Button variant="outline" onClick={handleAddWebsite}>
          <Globe className="w-4 h-4 mr-2" />
          Add Website
        </Button>
      </div>

      {knowledge.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No training data yet. Upload documents or add websites to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {knowledge.map((source: any) => (
            <Card key={source.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {source.sourceType === "document" ? (
                    <FileText className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Globe className="w-5 h-5 text-green-600" />
                  )}
                  <div>
                    <p className="font-medium">{source.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {source.sourceType === "document" && `${(source.fileSize / 1024).toFixed(0)} KB`}
                      {source.sourceType === "website" && source.websiteUrl}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {source.status === "completed" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {source.status === "processing" && (
                    <AlertCircle className="w-5 h-5 text-yellow-600 animate-pulse" />
                  )}
                  {source.status === "failed" && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(source.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
