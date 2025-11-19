
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export default function NotFound() {
  return (
    <main>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Animation/Icon */}
          <div className="mb-8 relative">
            <div className="text-9xl font-bold text-primary/10 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileQuestion className="h-24 w-24 text-primary animate-bounce" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! The page you&apos;re looking for seems to have wandered off. It might have been moved, deleted, or perhaps it never existed.
          </p>

          {/* Helpful Suggestions */}
          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold mb-3">Here&apos;s what you can do:</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Double-check the URL for typos or errors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Use the navigation menu to find what you need</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Return to our homepage and start fresh</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Contact us if you believe this is an error</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Go to Homepage
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">
                <Search className="mr-2 h-5 w-5" />
                Contact Us
              </Link>
            </Button>
          </div>

          {/* Popular Links */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              POPULAR PAGES
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/services" className="text-sm text-primary hover:underline">
                Our Services
              </Link>
              <Link href="/blog" className="text-sm text-primary hover:underline">
                Blog
              </Link>
              <Link href="/case-studies" className="text-sm text-primary hover:underline">
                Case Studies
              </Link>
              <Link href="/about" className="text-sm text-primary hover:underline">
                About Us
              </Link>
              <Link href="/pricing" className="text-sm text-primary hover:underline">
                Pricing
              </Link>
              <Link href="/marketing-assessment" className="text-sm text-primary hover:underline">
                Free Assessment
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
