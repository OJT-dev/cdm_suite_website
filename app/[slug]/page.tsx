
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { SectionPreview } from '@/components/page-builder/section-preview';
import { Section } from '@/lib/page-templates';
import type { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await prisma.customPage.findUnique({
    where: {
      slug: params.slug,
      status: 'published',
    },
  });

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.description || undefined,
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.description || undefined,
      ...(page.ogImage && { images: [page.ogImage] }),
    },
  };
}

export default async function CustomPage({ params }: PageProps) {
  const page = await prisma.customPage.findUnique({
    where: {
      slug: params.slug,
      status: 'published',
    },
  });

  if (!page) {
    notFound();
  }

  let sections: Section[] = [];

  try {
    const content = JSON.parse(page.content);
    sections = content.sections || [];
  } catch (error) {
    console.error('Error parsing page content:', error);
  }

  return (
    <div className="min-h-screen">
      {sections.map((section) => (
        <SectionPreview key={section.id} section={section} />
      ))}
      
      {sections.length === 0 && (
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          {page.description && (
            <p className="text-lg text-muted-foreground">{page.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
