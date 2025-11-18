
import { Metadata } from 'next';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { MarketingAssessmentClient } from '@/components/marketing-assessment-client';

export const metadata: Metadata = {
  title: '3-Minute Marketing Assessment | CDM Suite',
  description: 'Get a personalized marketing strategy analysis in just 3 minutes. Discover what\'s working, what\'s not, and how to grow your business faster.',
};

export default function MarketingAssessmentPage() {
  return (
    <main>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <MarketingAssessmentClient />
      </div>
      <Footer />
    </main>
  );
}
