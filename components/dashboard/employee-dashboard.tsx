
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  GitBranch,
  TrendingUp,
  Activity,
  DollarSign,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDetailedTimestamp } from "@/lib/utils";

interface EmployeeStats {
  leads: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
  };
  proposals: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    totalValue: number;
    conversionRate: string;
  };
  sequences: {
    active: number;
  };
  recentActivities: Array<{
    id: string;
    leadId: string;
    type: string;
    notes: string;
    createdAt: string;
    leadName: string;
    leadEmail: string;
  }>;
}

export function EmployeeDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/employee-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load dashboard data</p>
        <Button onClick={fetchStats} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CALL":
        return "📞";
      case "EMAIL":
        return "📧";
      case "MEETING":
        return "🤝";
      case "NOTE":
        return "📝";
      default:
        return "•";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="text-blue-100">
          Here's your work overview for today
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Leads */}
        <Link href="/dashboard/crm" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300 border-2 border-transparent">
            <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                +{stats.leads.new} new
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.leads.total}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-600">
              <span>Contacted: {stats.leads.contacted}</span>
              <span>Qualified: {stats.leads.qualified}</span>
            </div>
          </CardContent>
        </Card>
        </Link>

        {/* Proposals */}
        <Link href="/dashboard/proposals" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300 border-2 border-transparent">
            <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                {stats.proposals.draft} draft
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Proposals</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.proposals.total}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-600">
              <span>Sent: {stats.proposals.sent}</span>
              <span>Accepted: {stats.proposals.accepted}</span>
            </div>
          </CardContent>
        </Card>
        </Link>

        {/* Proposals Value */}
        <Link href="/dashboard/proposals" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300 border-2 border-transparent">
            <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {stats.proposals.conversionRate}% rate
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Pipeline Value</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.proposals.totalValue)}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
              Active proposals in pipeline
            </div>
          </CardContent>
        </Card>
        </Link>

        {/* Active Sequences */}
        <Link href="/dashboard/sequences" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300 border-2 border-transparent">
            <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <GitBranch className="w-6 h-6 text-orange-600" />
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">
                Active Sequences
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.sequences.active}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
              Automated outreach campaigns
            </div>
          </CardContent>
        </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Status Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Lead Pipeline Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    Pipeline Progress
                  </span>
                  <span className="text-gray-600">
                    {stats.leads.qualified}/{stats.leads.total} qualified
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                    style={{
                      width: `${
                        stats.leads.total > 0
                          ? (stats.leads.qualified / stats.leads.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.leads.total}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Total Leads</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.leads.new}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">New (7 days)</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.leads.contacted}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Contacted</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.leads.qualified}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Qualified</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button asChild className="flex-1">
                  <Link href="/dashboard/crm">View All Leads</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/dashboard/proposals">View Proposals</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposals Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Proposals at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {stats.proposals.draft}
                    </div>
                    <div className="text-xs text-gray-600">Draft</div>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/proposals?status=draft">View</Link>
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {stats.proposals.sent}
                    </div>
                    <div className="text-xs text-gray-600">Sent</div>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/proposals?status=sent">View</Link>
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {stats.proposals.accepted}
                    </div>
                    <div className="text-xs text-gray-600">Accepted</div>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/proposals?status=accepted">View</Link>
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Conversion Rate
                  </span>
                  <span className="font-bold text-green-600">
                    {stats.proposals.conversionRate}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${stats.proposals.conversionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Activities
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/crm">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No recent activities</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/dashboard/crm">Add First Activity</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => router.push(`/dashboard/crm?leadId=${activity.leadId}`)}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {activity.leadName}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {activity.notes}
                        </p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-gray-500 whitespace-nowrap cursor-help">
                              {formatDetailedTimestamp(activity.createdAt, { showTime: true }).relative}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{formatDetailedTimestamp(activity.createdAt, { showTime: true }).full}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
