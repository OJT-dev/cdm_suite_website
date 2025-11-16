
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { MarketingAutomation } from '@/components/marketing-automation';
import { Providers } from '@/components/providers';
import ClarityInit from '@/components/analytics/clarity-init';
import RedditPixel from '@/components/analytics/reddit-pixel';
import { PostHogProvider } from '@/components/analytics/posthog-provider';
import { PostHogPageView } from '@/components/analytics/posthog-pageview';
import GoogleAnalytics from '@/components/analytics/google-analytics';
import { Suspense } from 'react';

const inter = Inter({ subsets: ["latin"] });

// Base URL for metadata (resolves social OG/Twitter image URLs)
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cdmsuite.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "CDM Suite - Full Service Digital Marketing Agency",
  description: "Data-driven digital marketing strategies that deliver measurable results. Web design, digital advertising, mobile apps, and AI implementation services.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>
          <Providers>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            <GoogleAnalytics gaId={gaId} />
            <ClarityInit />
            <RedditPixel />
            {children}
            <Toaster position="top-right" />
            <MarketingAutomation />
          </Providers>
        </PostHogProvider>
      </body>
    </html>
  );
}
