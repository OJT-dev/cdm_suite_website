
"use client";

import { Card } from "@/components/ui/card";
import { MessageSquare, Users, Calendar, TrendingUp } from "lucide-react";

export function AgentAnalyticsTab({ agent }: { agent: any }) {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
        <p className="text-muted-foreground text-sm">
          Track your agent's performance and engagement
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-muted-foreground">Conversations</p>
          </div>
          <p className="text-3xl font-bold">{agent.totalConversations}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <p className="text-sm text-muted-foreground">Leads Captured</p>
          </div>
          <p className="text-3xl font-bold">{agent.totalLeadsCaptured}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-muted-foreground">Appointments</p>
          </div>
          <p className="text-3xl font-bold">{agent.totalAppointments}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-muted-foreground">Satisfaction</p>
          </div>
          <p className="text-3xl font-bold">
            {agent.satisfactionRating ? agent.satisfactionRating.toFixed(1) : "N/A"}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground">
          Detailed analytics coming soon! Track conversation trends, lead quality, peak hours, and more.
        </p>
      </Card>
    </div>
  );
}
