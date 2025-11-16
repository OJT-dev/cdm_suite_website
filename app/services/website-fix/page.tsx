
import { Metadata } from 'next';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import WebsiteFixCheckout from '@/components/services/website-fix-checkout';

export const metadata: Metadata = {
  title: 'Website Performance Fix - $100/month | CDM Suite',
  description: 'Fix all critical website issues with our affordable $100/month service. Guaranteed 20+ point score improvement in 7 days.',
  keywords: 'website fix, website performance, website optimization, website improvement',
};

export default function WebsiteFixPage() {
  return (
    <main>
      <Navigation />
      <WebsiteFixCheckout />
      <Footer />
    </main>
  );
}
