
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ServicePageClient from "@/components/service-page-client";

// Generate static paths for all services
export async function generateStaticParams() {
  // Avoid hitting the database during static generation to keep builds independent
  // of database availability. Service pages will be generated on-demand.
  return [];
}

// Fetch service data
async function getService(slug: string) {
  const service = await prisma.service.findUnique({
    where: { slug },
  });

  if (!service) {
    notFound();
  }

  return service;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const service = await getService(params.slug);

  return {
    title: `${service.name} | CDM Suite`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = await getService(params.slug);

  // Determine which hero image to use based on service slug
  const getHeroImage = (slug: string) => {
    if (slug.includes('website-maintenance')) return '/images/services/website-maintenance.png';
    if (slug.includes('website-creation')) return '/images/services/website-creation.png';
    if (slug.includes('seo')) return '/images/services/seo-services.png';
    if (slug.includes('social-media')) return '/images/services/social-media.png';
    if (slug.includes('ad-management')) return 'https://cdn.abacus.ai/images/c5dbf003-c21d-46d9-bde2-ea94af97ab30.png';
    if (slug.includes('app-creation')) return '/images/services/app-creation.png';
    if (slug.includes('app-maintenance')) return '/images/services/app-maintenance.png';
    if (slug.includes('bundle')) return '/images/services/bundles.png';
    return '/images/services/website-creation.png'; // default
  };

  // Determine service category for customized content
  const getServiceCategory = (slug: string) => {
    if (slug.includes('website-maintenance')) return 'website-maintenance';
    if (slug.includes('website-creation')) return 'website-creation';
    if (slug.includes('seo')) return 'seo';
    if (slug.includes('social-media')) return 'social-media';
    if (slug.includes('ad-management')) return 'ad-management';
    if (slug.includes('app-creation')) return 'app-creation';
    if (slug.includes('app-maintenance')) return 'app-maintenance';
    if (slug.includes('bundle')) return 'bundle';
    return 'general';
  };

  const heroImage = getHeroImage(service.slug);
  const category = getServiceCategory(service.slug);

  return (
    <ServicePageClient
      service={{
        ...service,
        features: JSON.parse(service.features) // Parse JSON string to string[]
      }}
      heroImage={heroImage}
      category={category}
    />
  );
}
