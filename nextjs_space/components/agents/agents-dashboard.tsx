
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Bot, TrendingUp, MessageSquare, Users, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Agent {
  id: string;
  name: string;
  slug: string;
  agentType: string;
  status: string;
  totalConversations: number;
  totalLeadsCaptured: number;
  satisfactionRating: number | null;
  isPublic: boolean;
  createdAt: string;
}

export function AgentsDashboard({ user }: { user: any }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    conversations: 0,
    leads: 0,
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (!response.ok) throw new Error("Failed to fetch agents");
      
      const data = await response.json();
      setAgents(data.agents);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Builder</h1>
          <p className="text-muted-foreground mt-2">
            Build and deploy revenue-generating AI agents
          </p>
        </div>
        <Link href="/dashboard/ai-agents/new">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Agents</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Agents</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversations</p>
              <p className="text-2xl font-bold">{stats.conversations}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Leads Captured</p>
              <p className="text-2xl font-bold">{stats.leads}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Agents List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
      ) : agents.length === 0 ? (
        <Card className="p-12 text-center">
          <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first AI agent to start generating revenue
          </p>
          <Link href="/dashboard/ai-agents/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Agent
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {agent.agentType.replace(/-/g, " ")}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  agent.status === "active" 
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}>
                  {agent.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conversations</span>
                  <span className="font-medium">{agent.totalConversations}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Leads</span>
                  <span className="font-medium">{agent.totalLeadsCaptured}</span>
                </div>
                {agent.satisfactionRating && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-medium">
                      {agent.satisfactionRating.toFixed(1)} / 5.0
                    </span>
                  </div>
                )}
              </div>

              {agent.isPublic && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-4">
                  <Eye className="w-4 h-4" />
                  <span>In public gallery</span>
                </div>
              )}

              <Link href={`/dashboard/ai-agents/${agent.id}`}>
                <Button variant="outline" className="w-full">
                  Manage Agent
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
