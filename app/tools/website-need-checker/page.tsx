
import { Metadata } from 'next';
import WebsiteNeedCheckerLanding from '@/components/tools/website-need-checker-landing';

export const metadata: Metadata = {
  title: 'Free Website Need Checker | Does Your Business Need a Website? | CDM Suite',
  description: 'Discover if your business needs a website with our free assessment tool. Calculate the ROI and business value of having an online presence. Get personalized recommendations and instant website solutions.',
  keywords: 'website need assessment, business website calculator, website ROI calculator, do I need a website, website value calculator, online presence assessment',
  openGraph: {
    title: 'Free Website Need Checker - Calculate Your Website ROI',
    description: 'Find out if your business needs a website and calculate the potential ROI. Get instant recommendations and solutions.',
    type: 'website',
  },
};

export default function WebsiteNeedCheckerPage() {
  return <WebsiteNeedCheckerLanding />;
}
