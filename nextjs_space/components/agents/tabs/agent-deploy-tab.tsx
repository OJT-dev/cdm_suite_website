
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";

export function AgentDeployTab({ agent }: { agent: any }) {
  const embedCode = `<!-- CDM Suite AI Agent -->
<script src="https://cdn.cdmsuite.com/agent-widget.js"></script>
<script>
  CDMAgent.init({
    agentId: "${agent.id}",
    slug: "${agent.slug}"
  });
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard!");
  };

  const widgetUrl = `https://cdmsuite.com/agents/${agent.slug}`;

  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Deploy Your Agent</h3>
        <p className="text-muted-foreground text-sm">
          Add your agent to any website with a simple embed code
        </p>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold mb-3">Agent URL</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={widgetUrl}
            readOnly
            className="flex-1 px-3 py-2 border rounded-md bg-muted"
          />
          <Button variant="outline" onClick={() => {
            navigator.clipboard.writeText(widgetUrl);
            toast.success("URL copied!");
          }}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => window.open(widgetUrl, "_blank")}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold mb-3">Embed Code</h4>
        <div className="relative">
          <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
            <code>{embedCode}</code>
          </pre>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Paste this code before the closing <code>&lt;/body&gt;</code> tag on your website
        </p>
      </Card>

      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📚 Need Help?
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Check out our documentation for detailed setup instructions, customization options, and best practices.
        </p>
      </Card>
    </div>
  );
}
