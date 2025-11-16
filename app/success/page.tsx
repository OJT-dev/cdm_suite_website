
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, LogIn, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackRedditPurchase } from '@/lib/reddit-tracking';
import { trackConversion } from '@/lib/analytics';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Track purchase conversion - dual tracking (client-side + server-side)
      // Value should be fetched from Stripe session in production
      trackRedditPurchase(0, 'USD');
      
      trackConversion('purchase', undefined, 'USD', {
        transactionId: sessionId,
      });
      
      // Verify session and update order status if needed
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Thank you for choosing CDM Suite. Your account has been created and you can now access your dashboard.
        </p>

        {/* Account Created Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-8 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Mail className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Your Account is Ready!
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We've created your client account and sent your login credentials to your email. 
            Check your inbox (and spam folder) for your temporary password.
          </p>
          <Link href="/auth/login">
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <LogIn className="h-4 w-4" />
              Log In to Dashboard
            </Button>
          </Link>
        </motion.div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">What happens next?</h2>
          <ul className="text-left space-y-2 text-gray-700 dark:text-gray-300">
            <li>✅ Check your email for login credentials</li>
            <li>✅ Log in to view your order status and service details</li>
            <li>✅ Our team will reach out within 24 hours to schedule a kickoff call</li>
            <li>✅ We'll begin the discovery phase and start bringing your vision to life</li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/">
            <Button variant="outline" size="lg">
              Back to Home
            </Button>
          </Link>
          <Link href="/dashboard/my-services">
            <Button size="lg" className="gap-2">
              View My Services
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="gap-2">
              Contact Us
            </Button>
          </Link>
        </div>

        {sessionId && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
            Order ID: {sessionId}
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
