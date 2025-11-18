export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CaseStudiesHero from "@/components/case-studies/case-studies-hero";
import CaseStudiesList from "@/components/case-studies/case-studies-list";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Case Studies - CDM Suite Success Stories",
  description: "See how CDM Suite has helped businesses achieve 150-300% ROI through data-driven digital marketing strategies. Real results, real growth.",
};

async function getCaseStudies() {
  // Skip database calls during build
  if (process.env.SKIP_BUILD_STATIC_GENERATION === 'true') {
    return [];
  }
  
  try {
    const studies = await prisma.caseStudy.findMany({
      where: { status: 'published' },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    return studies;
  } catch (error) {
    console.error('Error fetching case studies:', error);
    return [];
  }
}

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies();
  
  return (
    <main>
      <Navigation />
      <CaseStudiesHero />
      <CaseStudiesList studies={caseStudies} />
      <Footer />
    </main>
  );
}
