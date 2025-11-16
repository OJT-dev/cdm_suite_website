
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PreviewClient } from "@/components/builder/preview-client";
import { SslNotice } from "@/components/builder/ssl-notice";

export default async function PreviewPage({
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
    <>
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <SslNotice subdomain={project.subdomain || undefined} showDetails={true} />
        </div>
      </div>
      <PreviewClient
        project={{
          ...project,
          pages,
          siteConfig,
          businessData,
        }}
      />
    </>
  );
}
