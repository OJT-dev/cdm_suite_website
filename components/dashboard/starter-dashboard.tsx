
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
  Zap,
  FolderKanban,
  TrendingUp,
  BarChart3,
  Globe,
  Crown,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TrialCountdown } from "@/components/trial/trial-countdown";
import { TrialProgressCard } from "@/components/trial/trial-progress-card";
import { CreditsCard } from "@/components/dashboard/credits-card";
import { ProjectCard } from "@/components/dashboard/project-card";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AffiliateDashboard } from "@/components/dashboard/affiliate-dashboard";

export function StarterDashboard({ user }: { user: any }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(user.credits || 0);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
    fetchCredits();
  }, []);

  async function fetchCredits() {
    try {
      const response = await fetch("/api/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    }
  }

  function handleProjectDelete(projectId: string) {
    setProjects(projects.filter(p => p.id !== projectId));
  }

  const isTrialing = user.subscriptionStatus === "trialing";
  const trialDaysLeft = user.trialEndsAt
    ? Math.ceil(
        (new Date(user.trialEndsAt).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const projectLimit = 1; // Starter plan limit

  return (
    <div className="space-y-6">
      {/* Trial Countdown */}
      {isTrialing && trialDaysLeft > 0 && <TrialCountdown user={user} />}

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome to your Dashboard, {user.name?.split(" ")[0] || "there"}! 🚀
        </h1>
        <p className="text-blue-100">
          You're on the <strong>Starter Plan</strong>. Start building your
          first website with AI!
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CreditsCard credits={credits} tier={user.tier} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Visitors
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((sum, p) => sum + (p.visits || 0), 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Leads
            </CardTitle>
            <Globe className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((sum, p) => sum + (p.leads || 0), 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total captured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Conversions
            </CardTitle>
            <BarChart3 className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((sum, p) => sum + (p.conversions || 0), 0)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Conversion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects & Affiliate Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="affiliate">Affiliate Program</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    My Projects
                  </CardTitle>
                  <CardDescription>
                    Manage your websites - {projects.length} project{projects.length !== 1 ? "s" : ""} created
                  </CardDescription>
                </div>
                {credits > 0 && (
                  <Button asChild>
                    <Link href="/builder">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Website
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first website with our AI builder
                  </p>
                  {credits > 0 ? (
                    <Button asChild size="lg">
                      <Link href="/builder">
                        <Zap className="w-5 h-5 mr-2" />
                        Build Your First Website
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" variant="outline">
                      <Link href="/dashboard/billing">
                        <Crown className="w-5 h-5 mr-2" />
                        Get Credits to Start Building
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onDelete={handleProjectDelete}
                    />
                  ))}
                </div>
              )}

              {/* Out of credits alert */}
              {credits === 0 && (
                <Alert className="mt-4 border-orange-200 bg-orange-50">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <AlertDescription>
                    <p className="font-medium text-orange-900 mb-1">
                      Out of credits
                    </p>
                    <p className="text-sm text-orange-700 mb-2">
                      Upgrade your plan to get more credits and create additional websites!
                    </p>
                    <Button asChild size="sm" variant="default">
                      <Link href="/dashboard/billing">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliate">
          <AffiliateDashboard />
        </TabsContent>
      </Tabs>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              {projects.length === 0 ? "Build Your First Website" : "Create Another Site"}
            </CardTitle>
            <CardDescription>
              Let AI create a professional website for your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length < projectLimit ? (
              <Button asChild className="w-full" size="lg">
                <Link href="/builder">
                  Start Building with AI
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/dashboard/billing">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Create More
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Unlock More Features
            </CardTitle>
            <CardDescription>
              Get unlimited projects, advanced SEO, ads management & more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/dashboard/billing">View Upgrade Options</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Complete these steps to make the most of CDM Suite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "Complete your profile",
                description: "Add your business details",
                href: "/dashboard/settings",
                done: !!user.company,
              },
              {
                title: "Build your first website",
                description: "Use AI to create a professional site",
                href: "/builder",
                done: projects.length > 0,
              },
              {
                title: "Customize with visual editor",
                description: "Make it yours with drag-and-drop editing",
                href: projects.length > 0 ? `/builder/editor/${projects[0].id}` : "/builder",
                done: false,
              },
              {
                title: "Publish your site",
                description: "Go live and share with the world",
                href: "/dashboard/projects",
                done: projects.some(p => p.status === "active"),
              },
            ].map((step, i) => (
              <Link
                key={i}
                href={step.href}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.done
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    step.done
                      ? "bg-green-100 border-green-600"
                      : "border-gray-300"
                  }`}
                >
                  {step.done && (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
