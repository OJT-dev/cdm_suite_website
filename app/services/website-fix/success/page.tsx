
import { Metadata } from 'next';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import WebsiteFixSuccess from '@/components/services/website-fix-success';

export const metadata: Metadata = {
  title: 'Thank You! | CDM Suite',
  description: 'Your website fix service subscription is confirmed.',
};

export default function WebsiteFixSuccessPage() {
  return (
    <main>
      <Navigation />
      <WebsiteFixSuccess />
      <Footer />
    </main>
  );
}
