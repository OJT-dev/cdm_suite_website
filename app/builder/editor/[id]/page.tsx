
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { prisma } from "@/lib/db";
import { EnhancedVisualEditor } from "@/components/builder/enhanced-visual-editor";

export default async function EditorPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const project = await prisma.project.findUnique({
    where: {
      id: params.id,
      userId: user.id,
    },
  });

  if (!project) {
    redirect("/dashboard/projects");
  }

  // Parse project data
  const pages = project.pages ? JSON.parse(project.pages) : [];
  const siteConfig = project.siteConfig ? JSON.parse(project.siteConfig) : {};
  const businessData = project.businessData ? JSON.parse(project.businessData) : {};

  return (
    <DashboardLayout user={user}>
      <EnhancedVisualEditor
        project={{
          ...project,
          pages,
          siteConfig,
          businessData,
        }}
      />
    </DashboardLayout>
  );
}
