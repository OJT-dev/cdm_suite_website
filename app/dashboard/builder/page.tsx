
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles, Layout, Zap, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function BuilderPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.tier === "free") {
    redirect("/dashboard/billing");
  }

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Website Builder</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Build your website with AI assistance in minutes
          </p>
        </div>

        {/* Professional Services Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                <h3 className="text-lg sm:text-xl font-bold">Want a Professional Website?</h3>
              </div>
              <p className="text-sm sm:text-base opacity-90">
                DIY is great for testing, but our professional team delivers production-ready, 
                custom websites starting at just $420. No templates, no compromises.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
                <Link href="/pricing">
                  View Services
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto bg-white/10 text-white border-white hover:bg-white/20">
                <Link href="/contact?subject=Professional%20Website">
                  <span className="truncate">Talk to Team</span>
                  <ArrowRight className="ml-2 w-4 h-4 flex-shrink-0" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Build Your DIY Website Now
            </CardTitle>
            <CardDescription>
              Let our AI create a prototype website tailored to your business in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Link href="/builder">
                <Zap className="w-5 h-5 mr-2" />
                Start Building
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>AI-Powered Generation</CardTitle>
              <CardDescription>
                Describe your business in a few words and our AI creates a complete website
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Layout className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Professional Templates</CardTitle>
              <CardDescription>
                Choose from various templates optimized for different industries
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Instant Deployment</CardTitle>
              <CardDescription>
                Your website goes live instantly on a custom subdomain
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Choose a Template</h4>
                  <p className="text-sm text-muted-foreground">
                    Select a template that matches your business type
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Describe Your Business</h4>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your business - or use AI to auto-fill the form
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">AI Generates Your Site</h4>
                  <p className="text-sm text-muted-foreground">
                    Our AI creates professional content and designs your website
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Launch & Grow</h4>
                  <p className="text-sm text-muted-foreground">
                    Your website goes live instantly and you can keep improving it
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
