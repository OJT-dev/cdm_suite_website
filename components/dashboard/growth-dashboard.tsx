
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FolderKanban,
  TrendingUp,
  BarChart3,
  Globe,
  Target,
  DollarSign,
  Zap,
  Users,
} from "lucide-react";

export function GrowthDashboard({ user }: { user: any }) {
  const tierConfig = {
    growth: { projects: 3, name: "Growth" },
    pro: { projects: -1, name: "Pro" },
    enterprise: { projects: -1, name: "Enterprise" },
  };

  const config =
    tierConfig[user.tier as keyof typeof tierConfig] || tierConfig.growth;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {user.name?.split(" ")[0] || "Welcome"}'s Command Center 🎯
        </h1>
        <p className="text-purple-100">
          You're on the <strong>{config.name} Plan</strong>. Full access to all
          marketing tools and analytics.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Projects
            </CardTitle>
            <FolderKanban className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              0 {config.projects > 0 && `/ ${config.projects}`}
            </div>
            <p className="text-xs text-green-600 mt-1 font-medium">
              {config.projects === -1 ? "Unlimited" : `${config.projects} slots available`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Visitors
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Leads Captured
            </CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-green-600 mt-1 font-medium">
              +0% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ad Spend ROI
            </CardTitle>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0x</div>
            <p className="text-xs text-gray-500 mt-1">Return on ad spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              AI Website Builder
            </CardTitle>
            <CardDescription>
              Create a new website with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/builder">Start Building</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Manage Ad Campaigns
            </CardTitle>
            <CardDescription>
              Create and optimize your ad campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/ads">View Campaigns</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Analytics & Reports
            </CardTitle>
            <CardDescription>
              Deep dive into your performance data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Projects list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>
                Manage your websites, campaigns, and apps
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/projects">
                <FolderKanban className="mr-2 h-4 w-4" />
                View All Projects
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-sm mb-4">
              Create your first project to get started with CDM Suite
            </p>
            <Button asChild>
              <Link href="/dashboard/builder">Create Your First Project</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
