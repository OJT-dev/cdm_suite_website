
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ShopifyIntegrationClient } from "@/components/builder/shopify-integration-client";

export default async function ShopifyIntegrationPage({
  params,
}: {
  params: { projectId: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch project
  const project = await prisma.project.findFirst({
    where: {
      id: params.projectId,
      userId: user.id,
    },
  });

  if (!project) {
    redirect("/dashboard/projects");
  }

  return <ShopifyIntegrationClient project={project} />;
}
