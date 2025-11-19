

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Eye, ExternalLink, Trash2, Globe } from "lucide-react";
import { toast } from "react-hot-toast";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    type: string;
    status: string;
    subdomain: string | null;
    customDomain: string | null;
    createdAt: string;
    updatedAt: string;
  };
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Project deleted successfully");
        onDelete?.(project.id);
        setShowDeleteDialog(false);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete project");
      }
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const projectUrl = project.customDomain
    ? `https://${project.customDomain}`
    : project.subdomain
    ? `https://${project.subdomain}.cdmsuite.com`
    : null;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                {project.name}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge
              variant={
                project.status === "active"
                  ? "default"
                  : project.status === "draft"
                  ? "secondary"
                  : "outline"
              }
            >
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Project URL */}
            {projectUrl && (
              <div className="text-sm text-gray-600 truncate">
                <a
                  href={projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {projectUrl.replace("https://", "")}
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link href={`/builder/editor/${project.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              {projectUrl && (
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <a href={projectUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </a>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{project.name}". This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
