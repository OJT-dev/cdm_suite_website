
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { WebsiteRenderer } from "@/components/builder/website-renderer";

interface SitePageProps {
  params: {
    subdomain: string;
  };
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata({ params, searchParams }: SitePageProps) {
  const project = await prisma.project.findFirst({
    where: { subdomain: params.subdomain },
  });

  if (!project) {
    return {
      title: "Website Not Found",
    };
  }

  const siteConfig = project.siteConfig ? JSON.parse(project.siteConfig) : {};
  const pages = project.pages ? JSON.parse(project.pages) : [];
  const currentPageSlug = searchParams.page || "home";
  const currentPage = pages.find((p: any) => p.slug === currentPageSlug);

  return {
    title: currentPage?.metaTitle || siteConfig.siteName || "Website",
    description: currentPage?.metaDescription || siteConfig.seo?.metaDescription || "",
  };
}

export default async function SitePage({ params, searchParams }: SitePageProps) {
  const project = await prisma.project.findFirst({
    where: { subdomain: params.subdomain },
  });

  if (!project) {
    notFound();
  }

  const pages = project.pages ? JSON.parse(project.pages) : [];
  const siteConfig = project.siteConfig ? JSON.parse(project.siteConfig) : {};
  const navigationConfig = project.navigationConfig ? JSON.parse(project.navigationConfig) : null;
  const globalStyles = project.globalStyles ? JSON.parse(project.globalStyles) : null;
  
  const currentPageSlug = searchParams.page || "home";
  const currentPage = pages.find((p: any) => p.slug === currentPageSlug);

  if (!currentPage) {
    notFound();
  }

  return (
    <WebsiteRenderer
      page={currentPage}
      pages={pages}
      siteConfig={siteConfig}
      subdomain={params.subdomain}
      navigationConfig={navigationConfig}
      globalStyles={globalStyles}
    />
  );
}
