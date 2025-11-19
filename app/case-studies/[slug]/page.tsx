
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { prisma } from '@/lib/db';

export async function generateStaticParams() {
  // Avoid hitting the database during static generation to keep builds independent
  // of database availability. Case study pages will be generated on-demand.
  return [];
}

async function getCaseStudy(slug: string) {
  try {
    const study = await prisma.caseStudy.findUnique({
      where: { slug, status: 'published' }
    });
    return study;
  } catch (error) {
    console.error('Error fetching case study:', error);
    return null;
  }
}

export default async function CaseStudyDetailPage({ params }: { params: { slug: string } }) {
  const study = await getCaseStudy(params.slug);

  if (!study) {
    notFound();
  }
  
  // Parse JSON fields
  const results = Array.isArray(study.results) ? study.results : [];
  const tags = Array.isArray(study.tags) ? study.tags : [];

  return (
    <main>
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="section-container">
          <Link href="/case-studies" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Case Studies
          </Link>
          
          <div className="max-w-4xl">
            <span className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {study.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {study.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              {study.description}
            </p>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="relative h-96 md:h-[500px] bg-gray-100 dark:bg-gray-800">
        <Image
          src={study.heroImage.startsWith('uploads/') ? `/api/file/${encodeURIComponent(study.heroImage)}` : study.heroImage}
          alt={study.title}
          fill
          className="object-cover"
          priority
        />
      </section>

      {/* Content */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="section-container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Challenge */}
            {study.challenge && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  The Challenge
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {study.challenge}
                </p>
              </div>
            )}

            {/* Solution */}
            {study.solution && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Solution
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {study.solution}
                </p>
              </div>
            )}
          </div>

          {/* Results */}
          {results && results.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Results Achieved
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.map((result: any, idx: number) => (
                  <div key={idx} className="bg-primary/5 dark:bg-primary/10 p-6 rounded-lg text-center">
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{result}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonial */}
          {study.testimonialQuote && (
            <div className="bg-gray-50 dark:bg-gray-800 p-8 md:p-12 rounded-lg mb-16">
              <Quote className="w-12 h-12 text-primary mb-6" />
              <blockquote className="text-lg md:text-xl text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed">
                "{study.testimonialQuote}"
              </blockquote>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {study.testimonialAuthor}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {study.testimonialCompany}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Services Provided:
            </h3>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag: any, idx: number) => (
                <span key={idx} className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Achieve Similar Results?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Let's discuss how we can help your business grow with our proven digital marketing strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">
                  Get Started Today
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Our Packages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
