
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Zap } from "lucide-react";
import { toast } from "react-hot-toast";

export function AgentWorkflowsTab({ agent }: { agent: any }) {
  const [workflows, setWorkflows] = useState(agent.workflowRules || []);

  const handleCreate = () => {
    toast.success("Workflow builder coming soon!");
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold mb-2">Automation Workflows</h3>
          <p className="text-muted-foreground text-sm">
            Create trigger-action workflows to automate tasks
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <Card className="p-12 text-center">
          <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            No workflows configured yet
          </p>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Workflow
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow: any) => (
            <Card key={workflow.id} className="p-4">
              <h4 className="font-semibold">{workflow.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {workflow.description}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
