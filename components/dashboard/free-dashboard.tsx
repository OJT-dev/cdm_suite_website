
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
  Lock,
  Rocket,
  CheckCircle2,
  TrendingUp,
  Zap,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function FreeDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome to CDM Suite, {user.name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="text-blue-100 mb-4">
          You're on the Free plan. Upgrade to unlock powerful marketing tools
          and AI-powered website builder.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-white text-blue-600 hover:bg-gray-100"
        >
          <Link href="/dashboard/billing">
            <Rocket className="mr-2 h-5 w-5" />
            Try DIY Builder - $29/mo
          </Link>
        </Button>
      </div>

      {/* Professional Services CTA */}
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-white to-blue-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Need Professional Results?
                </h3>
              </div>
              <p className="text-gray-700 mb-2">
                Skip the DIY and let our expert team build your custom website, 
                handle your marketing, or develop your mobile app.
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Websites from $420
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Marketing from $175/mo
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Apps from $1,225
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="default" size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Link href="/dashboard/services">
                  Browse Services
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact?subject=Professional%20Services">
                  Talk to Team
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Free Audit
            </CardTitle>
            <CardDescription>
              Get your website analyzed for free
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auditor">Run Free Audit</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-400">
              <Zap className="w-5 h-5" />
              AI Website Builder
            </CardTitle>
            <CardDescription>Build stunning sites with AI</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/billing">Unlock with Starter</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-400">
              <BarChart3 className="w-5 h-5" />
              Analytics Dashboard
            </CardTitle>
            <CardDescription>Track your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/billing">Unlock with Starter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Unlock Premium Features</CardTitle>
          <CardDescription>
            See what you'll get with a paid plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">AI Website Builder</h4>
                <p className="text-sm text-gray-600">
                  Build professional websites with AI assistance in minutes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Advanced SEO Tools</h4>
                <p className="text-sm text-gray-600">
                  Optimize your site for search engines with powerful tools
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Analytics & Reporting</h4>
                <p className="text-sm text-gray-600">
                  Track visitors, leads, and conversions in real-time
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Priority Support</h4>
                <p className="text-sm text-gray-600">
                  Get help when you need it from our expert team
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard/billing">
                <TrendingUp className="mr-2 h-5 w-5" />
                View All Plans & Pricing
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
