
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar, Mail, Database, CreditCard, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";

const INTEGRATIONS = [
  { id: "calendar", name: "Google Calendar", icon: Calendar, description: "Book appointments" },
  { id: "email", name: "Email", icon: Mail, description: "Send emails" },
  { id: "crm", name: "CRM", icon: Database, description: "Sync with CRM" },
  { id: "payment", name: "Stripe", icon: CreditCard, description: "Process payments" },
  { id: "slack", name: "Slack", icon: MessageSquare, description: "Send notifications" },
];

export function AgentIntegrationsTab({ agent }: { agent: any }) {
  const [integrations, setIntegrations] = useState(agent.integrationConfigs || []);

  const isEnabled = (integrationId: string) => {
    return integrations.some((i: any) => i.serviceType === integrationId && i.status === "connected");
  };

  const handleToggle = async (integrationId: string, enabled: boolean) => {
    if (enabled) {
      // Show configuration dialog
      toast.success(`${integrationId} integration is coming soon!`);
    } else {
      // Disable integration
      toast.success(`${integrationId} integration disabled`);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Third-Party Integrations</h3>
        <p className="text-muted-foreground text-sm">
          Connect external services to unlock powerful automation
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon;
          const enabled = isEnabled(integration.id);
          
          return (
            <Card key={integration.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{integration.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {integration.description}
                    </p>
                    {enabled && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        ✓ Connected
                      </p>
                    )}
                  </div>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => handleToggle(integration.id, checked)}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
