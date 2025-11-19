
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ProjectsList } from "@/components/dashboard/projects-list";

export const metadata = {
  title: "My Projects | CDM Suite",
  description: "Manage your websites and projects",
};

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user's projects
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Projects</h1>
        <p className="text-muted-foreground mt-2">
          Manage your websites, campaigns, and digital assets
        </p>
      </div>

      <ProjectsList projects={projects} user={user} />
    </div>
  );
}
