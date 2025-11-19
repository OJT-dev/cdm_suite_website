
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Mail, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

function WebsiteFixSuccessInner() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    if (sessionId) {
      // Optionally fetch session details from Stripe
      // For now, we'll just show success message
      setSessionData({ id: sessionId });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Main Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Welcome Aboard! 🎉
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Your subscription is confirmed. We're excited to transform your website!
          </p>

          {/* What Happens Next */}
          <Card className="mb-8 text-left">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                What Happens Next?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Check Your Email</h3>
                    <p className="text-slate-600 text-sm">
                      We've sent a confirmation email with your receipt and next steps. If you don't see it, check your spam folder.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Kickoff Call (Within 24 Hours)</h3>
                    <p className="text-slate-600 text-sm">
                      Our team will reach out to schedule a quick kickoff call. We'll discuss your goals, timeline, and any specific requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">We Get to Work</h3>
                    <p className="text-slate-600 text-sm">
                      Our team will start fixing all the critical issues identified in your audit. You'll receive daily progress updates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Launch & Celebrate (Day 7)</h3>
                    <p className="text-slate-600 text-sm">
                      We'll launch your improved website within 7 days. You'll see a dramatic improvement in speed, SEO, and user experience.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">Schedule Your Call</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Pick a time that works for you
                </p>
                <Link href="/contact">
                  <Button variant="outline" size="sm" className="w-full">
                    Schedule Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                {session ? (
                  <>
                    <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">View Dashboard</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Track your project progress
                    </p>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="w-full">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">Create Account</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Track your project progress
                    </p>
                    <Link href="/auth/signup">
                      <Button variant="outline" size="sm" className="w-full">
                        Sign Up Free
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">Have Questions?</h3>
                <p className="text-sm text-slate-600 mb-4">
                  We're here to help
                </p>
                <a href="tel:8622727623">
                  <Button variant="outline" size="sm" className="w-full">
                    Call Us Now
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Quality Assurance */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">
                  Quality Guarantee
                </h3>
              </div>
              <p className="text-green-700 text-center">
                We're committed to delivering exceptional results. Our team will work with you until you're completely satisfied with your website improvements.
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-8">
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                Return to Homepage
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function WebsiteFixSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 py-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <WebsiteFixSuccessInner />
    </Suspense>
  );
}
