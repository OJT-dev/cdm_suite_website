
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, MessageSquare, Users, Star, Search } from "lucide-react";
import Image from "next/image";

export function AgentGalleryClient({ agents: initialAgents }: { agents: any[] }) {
  const [agents, setAgents] = useState(initialAgents);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const types = ["all", ...Array.from(new Set(agents.map(a => a.agentType)))];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase()) ||
                          (agent.galleryDescription && agent.galleryDescription.toLowerCase().includes(search.toLowerCase()));
    const matchesType = selectedType === "all" || agent.agentType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Agent Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover powerful AI agents built with CDM Suite AI Agent Builder
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {types.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type === "all" ? "All" : type.split('-').map((word: string) => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No agents found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">
                      {agent.galleryTitle || agent.name}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {agent.agentType.replace(/-/g, " ")}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {agent.galleryDescription || `An AI agent for ${agent.agentType.replace(/-/g, " ")}`}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <MessageSquare className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="font-semibold">{agent.totalConversations}</p>
                    <p className="text-xs text-muted-foreground">Convos</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="font-semibold">{agent.totalLeadsCaptured}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <Star className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="font-semibold">
                      {agent.satisfactionRating ? agent.satisfactionRating.toFixed(1) : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>

                {agent.galleryTags && agent.galleryTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {agent.galleryTags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <Button variant="outline" className="w-full">
                  View Agent
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
