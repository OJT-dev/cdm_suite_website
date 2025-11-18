
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  FileText, 
  Calculator, 
  TrendingUp, 
  Mail, 
  DollarSign,
  Lock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface ServiceAccess {
  tier: string;
  toolsAccess: Record<string, boolean>;
  limits: Record<string, number>;
  usageThisMonth: Record<string, number>;
  features: Record<string, boolean>;
}

export default function SelfServicePortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [access, setAccess] = useState<ServiceAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAccess();
    }
  }, [session]);

  const fetchAccess = async () => {
    try {
      const res = await fetch('/api/self-service/access');
      if (res.ok) {
        const data = await res.json();
        setAccess(data.access);
      }
    } catch (error) {
      console.error('Error fetching access:', error);
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    {
      id: 'seoChecker',
      name: 'SEO Checker',
      description: 'Analyze website SEO and get improvement recommendations',
      icon: Search,
      url: '/tools/seo-checker',
      usageKey: 'seoChecksUsed',
      limitKey: 'seoChecksPerMonth',
    },
    {
      id: 'auditTool',
      name: 'Website Auditor',
      description: 'Comprehensive website audit with performance analysis',
      icon: FileText,
      url: '/auditor',
      usageKey: 'auditsUsed',
      limitKey: 'auditsPerMonth',
    },
    {
      id: 'roiCalculator',
      name: 'ROI Calculator',
      description: 'Calculate potential return on marketing investment',
      icon: Calculator,
      url: '/tools/roi-calculator',
      usageKey: null,
      limitKey: null,
    },
    {
      id: 'budgetPlanner',
      name: 'Budget Calculator',
      description: 'Plan your marketing budget allocation',
      icon: DollarSign,
      url: '/tools/budget-calculator',
      usageKey: null,
      limitKey: null,
    },
    {
      id: 'conversionAnalyzer',
      name: 'Conversion Analyzer',
      description: 'Analyze and improve conversion rates',
      icon: TrendingUp,
      url: '/tools/conversion-analyzer',
      usageKey: null,
      limitKey: null,
    },
    {
      id: 'emailTester',
      name: 'Email Tester',
      description: 'Test and optimize email deliverability',
      icon: Mail,
      url: '/tools/email-tester',
      usageKey: null,
      limitKey: null,
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!access) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Unable to load access information</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Self-Service Tools</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Access powerful marketing tools based on your plan
        </p>
      </div>

      {/* Current Plan */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
            <div>
              <CardTitle className="text-lg sm:text-xl capitalize">{access.tier} Plan</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your current subscription tier</CardDescription>
            </div>
            <Badge className="bg-blue-600 text-white w-fit">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">Audits This Month</div>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl font-bold">
                  {access.usageThisMonth.auditsUsed || 0}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  / {access.limits.auditsPerMonth}
                </span>
              </div>
              <Progress 
                value={(access.usageThisMonth.auditsUsed || 0) / access.limits.auditsPerMonth * 100} 
                className="h-2 mt-2" 
              />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">SEO Checks</div>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl font-bold">
                  {access.usageThisMonth.seoChecksUsed || 0}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  / {access.limits.seoChecksPerMonth}
                </span>
              </div>
              <Progress 
                value={(access.usageThisMonth.seoChecksUsed || 0) / access.limits.seoChecksPerMonth * 100} 
                className="h-2 mt-2" 
              />
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">Projects</div>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl font-bold">
                  {access.usageThisMonth.projectsUsed || 0}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  / {access.limits.projectsLimit}
                </span>
              </div>
              <Progress 
                value={(access.usageThisMonth.projectsUsed || 0) / access.limits.projectsLimit * 100} 
                className="h-2 mt-2" 
              />
            </div>
          </div>

          {access.tier === 'free' && (
            <div className="mt-4 p-3 sm:p-4 bg-white rounded-lg border">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                Upgrade to unlock more tools and higher limits
              </p>
              <Link href="/pricing">
                <Button size="sm" className="w-full sm:w-auto">
                  View Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Available Tools</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {tools.map((tool) => {
            const hasAccess = access.toolsAccess[tool.id];
            const Icon = tool.icon;
            const usage = tool.usageKey ? access.usageThisMonth[tool.usageKey] || 0 : null;
            const limit = tool.limitKey ? access.limits[tool.limitKey] : null;
            const isLimitReached = limit !== null && usage !== null && usage >= limit;

            return (
              <Card 
                key={tool.id} 
                className={`hover:shadow-lg transition-shadow ${!hasAccess ? 'opacity-60' : ''}`}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-2">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                    {hasAccess ? (
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  <CardTitle className="text-base sm:text-lg">{tool.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {usage !== null && limit !== null && (
                    <div className="mb-3 text-xs sm:text-sm">
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span className="truncate mr-2">Usage this month</span>
                        <span className="flex-shrink-0">{usage} / {limit}</span>
                      </div>
                      <Progress value={(usage / limit) * 100} className="h-1" />
                    </div>
                  )}

                  {hasAccess ? (
                    isLimitReached ? (
                      <Button variant="outline" disabled className="w-full text-sm">
                        Limit Reached
                      </Button>
                    ) : (
                      <Link href={tool.url} className="block">
                        <Button className="w-full group text-sm">
                          Use Tool
                          <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )
                  ) : (
                    <Link href="/pricing" className="block">
                      <Button variant="outline" className="w-full text-sm">
                        <Lock className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Upgrade to Unlock
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features */}
      {access.features && Object.keys(access.features).length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Plan Features</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Additional features included in your plan</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {Object.entries(access.features).map(([key, enabled]) => (
                <div key={key} className="flex items-center gap-2">
                  {enabled ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-xs sm:text-sm ${enabled ? '' : 'text-muted-foreground'}`}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
