
import { Metadata } from 'next';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import AuditorClient from '@/components/auditor/auditor-client';

export const metadata: Metadata = {
  title: 'Free Website Audit | CDM Suite - Get Your Marketing Score',
  description: 'Get a comprehensive free audit of your website. Analyze SEO, performance, mobile-friendliness, and security. Receive personalized recommendations to grow your business.',
  keywords: 'website audit, SEO audit, website analyzer, marketing audit, free website check',
};

export default function AuditorPage() {
  return (
    <main>
      <Navigation />
      <AuditorClient />
      <Footer />
    </main>
  );
}
