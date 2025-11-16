
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

function ProposalSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const proposalId = searchParams?.get('proposal');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/');
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Payment Successful! 🎉
          </CardTitle>
          <CardDescription className="text-lg">
            Thank you for your payment. Your proposal has been marked as paid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Our team has been notified and will begin work immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>You'll receive a confirmation email with project details</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Your dedicated account manager will contact you within 24 hours</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Questions? Contact us at
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="tel:8622727623"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                (862) 272-7623
              </a>
              <span className="hidden sm:inline text-gray-400">•</span>
              <a
                href="mailto:info@cdmsuite.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                info@cdmsuite.com
              </a>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Redirecting to homepage in {countdown} seconds...
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/">
                <Button>
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">
                  Contact Support
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {proposalId && (
            <p className="text-xs text-center text-gray-400">
              Proposal ID: {proposalId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProposalSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    }>
      <ProposalSuccessContent />
    </Suspense>
  );
}
