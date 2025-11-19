
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, BookOpen, Link as LinkIcon, Zap, BarChart3, Code } from "lucide-react";
import { AgentSettingsTab } from "./tabs/agent-settings-tab";
import { AgentKnowledgeTab } from "./tabs/agent-knowledge-tab";
import { AgentIntegrationsTab } from "./tabs/agent-integrations-tab";
import { AgentWorkflowsTab } from "./tabs/agent-workflows-tab";
import { AgentAnalyticsTab } from "./tabs/agent-analytics-tab";
import { AgentDeployTab } from "./tabs/agent-deploy-tab";

export function AgentEditor({ agent, user }: { agent: any; user: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("settings");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground mt-1">
            {agent.agentType.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/ai-agents")}>
          Back to Agents
        </Button>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <BookOpen className="w-4 h-4 mr-2" />
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <LinkIcon className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="workflows">
              <Zap className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="deploy">
              <Code className="w-4 h-4 mr-2" />
              Deploy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <AgentSettingsTab agent={agent} />
          </TabsContent>
          
          <TabsContent value="knowledge">
            <AgentKnowledgeTab agent={agent} />
          </TabsContent>
          
          <TabsContent value="integrations">
            <AgentIntegrationsTab agent={agent} />
          </TabsContent>
          
          <TabsContent value="workflows">
            <AgentWorkflowsTab agent={agent} />
          </TabsContent>
          
          <TabsContent value="analytics">
            <AgentAnalyticsTab agent={agent} />
          </TabsContent>
          
          <TabsContent value="deploy">
            <AgentDeployTab agent={agent} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
