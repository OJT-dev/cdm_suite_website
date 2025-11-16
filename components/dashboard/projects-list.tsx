
"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Edit,
  Eye,
  Trash2,
  ExternalLink,
  Plus,
  Calendar,
  TrendingUp,
} from "lucide-react";

interface ProjectsListProps {
  projects: any[];
  user: any;
}

export function ProjectsList({ projects, user }: ProjectsListProps) {
  const projectLimit = user.tier === "starter" ? 1 : user.tier === "growth" ? 3 : 999;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with create button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {projects.length} of {projectLimit === 999 ? "unlimited" : projectLimit} project
            {projectLimit !== 1 ? "s" : ""} used
          </p>
        </div>
        {projects.length < projectLimit && (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/builder">
              <Plus className="w-4 h-4 mr-2" />
              Create New Website
            </Link>
          </Button>
        )}
      </div>

      {/* Projects grid */}
      {projects.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">No projects yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Create your first website with our AI builder
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/builder">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Build Your First Website
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Project preview */}
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center border-b">
                <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 opacity-50" />
              </div>

              {/* Project details */}
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-bold text-base sm:text-lg truncate flex-1">{project.name}</h3>
                  <Badge
                    variant={
                      project.status === "active"
                        ? "default"
                        : project.status === "draft"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs flex-shrink-0"
                  >
                    {project.status}
                  </Badge>
                </div>

                {project.subdomain && (
                  <a
                    href={`https://${project.subdomain}.cdmsuite.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3 sm:mb-4 break-all"
                  >
                    <span className="truncate">{project.subdomain}.cdmsuite.com</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-center">
                  <div className="bg-muted rounded-lg p-1.5 sm:p-2">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Visits</p>
                    <p className="text-sm sm:text-base font-semibold">{project.visits}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-1.5 sm:p-2">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Leads</p>
                    <p className="text-sm sm:text-base font-semibold">{project.leads}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-1.5 sm:p-2">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Conv.</p>
                    <p className="text-sm sm:text-base font-semibold">{project.conversions}</p>
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 text-xs sm:text-sm h-8 sm:h-9">
                    <Link href={`/builder/preview/${project.id}`}>
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Preview</span>
                      <span className="sm:hidden">View</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1 text-xs sm:text-sm h-8 sm:h-9">
                    <Link href={`/builder/editor/${project.id}`}>
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upgrade prompt */}
      {projects.length >= projectLimit && projectLimit < 999 && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Project Limit Reached</h3>
              <p className="text-muted-foreground mb-4">
                You've used all {projectLimit} project slots in your {user.tier} plan. 
                Upgrade to create more websites!
              </p>
              <Button asChild>
                <Link href="/dashboard/billing">
                  Upgrade Plan
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
