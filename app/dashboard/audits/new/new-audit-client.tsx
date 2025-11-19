
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Smartphone, 
  Shield, 
  Zap,
  Target,
  Globe,
  ArrowRight,
  Award,
  BarChart3,
  RefreshCw,
  Save,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface AuditResult {
  overall_score: number;
  seo_score: number;
  performance_score: number;
  mobile_score: number;
  security_score: number;
  findings: {
    critical: string[];
    warnings: string[];
    good: string[];
  };
  recommendations: {
    category: string;
    priority: 'high' | 'medium' | 'low';
    issue: string;
    solution: string;
    estimatedImpact: string;
  }[];
  suggestedServices: {
    name: string;
    reason: string;
    price: string;
    slug: string;
  }[];
}

export function NewAuditClient({ user }: { user: any }) {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'analyzing' | 'results'>('input');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill URL from query params if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('url');
      if (urlParam) {
        setWebsiteUrl(decodeURIComponent(urlParam));
      }
    }
  }, []);

  const goalOptions = [
    { id: 'increase-traffic', label: 'Increase Website Traffic', icon: TrendingUp },
    { id: 'improve-seo', label: 'Improve SEO Ranking', icon: Search },
    { id: 'generate-leads', label: 'Generate More Leads', icon: Target },
    { id: 'boost-sales', label: 'Boost Online Sales', icon: BarChart3 },
    { id: 'mobile-optimization', label: 'Mobile Optimization', icon: Smartphone },
    { id: 'faster-loading', label: 'Faster Load Times', icon: Zap },
  ];

  const handleGoalToggle = (goalId: string) => {
    setGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteUrl) {
      toast.error('Please enter a website URL');
      return;
    }

    setIsLoading(true);
    setStep('analyzing');

    try {
      const response = await fetch('/api/auditor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl,
          email: user.email,
          name: user.name,
          goals,
          userId: user.id,
          isAuthenticated: true
        }),
      });

      if (!response.ok) throw new Error('Audit failed');

      const result = await response.json();
      setAuditResult(result.audit);
      setStep('results');
      toast.success('Audit complete! Results have been saved.');
    } catch (error) {
      console.error('Audit error:', error);
      toast.error('Failed to complete audit. Please try again.');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Critical';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/audits')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Audits
            </Button>
          </div>
          <h1 className="text-3xl font-bold">New Website Audit</h1>
          <p className="text-slate-600 mt-1">
            Analyze your website's performance and get actionable insights
          </p>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Website Information</CardTitle>
                <CardDescription>
                  Enter the website URL you want to audit
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Website URL */}
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl" className="text-base font-semibold">
                      Website URL <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="websiteUrl"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="pl-11 h-12 text-base"
                        required
                      />
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      What are your main goals? (Optional)
                    </Label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {goalOptions.map((goal) => (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => handleGoalToggle(goal.id)}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                            goals.includes(goal.id)
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <goal.icon className={`w-5 h-5 ${
                            goals.includes(goal.id) ? 'text-blue-600' : 'text-slate-400'
                          }`} />
                          <span className={`text-sm font-medium ${
                            goals.includes(goal.id) ? 'text-blue-900' : 'text-slate-700'
                          }`}>
                            {goal.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard/audits')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Start Audit
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="shadow-lg">
              <CardContent className="py-16">
                <div className="text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                      <Search className="w-12 h-12 text-white animate-pulse" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Analyzing Your Website...</h3>
                    <p className="text-slate-600">This will only take a moment</p>
                  </div>

                  <div className="max-w-md mx-auto space-y-3">
                    {[
                      'Checking SEO optimization',
                      'Testing page speed & performance',
                      'Analyzing mobile responsiveness',
                      'Scanning security vulnerabilities',
                      'Generating recommendations',
                    ].map((text, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.3 }}
                        className="flex items-center gap-3 text-left"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-slate-700">{text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'results' && auditResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Success Banner */}
            <Card className="shadow-lg border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Save className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">
                      Audit Complete!
                    </p>
                    <p className="text-sm text-green-700">
                      Results have been saved to your audit history
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Score */}
            <Card className="shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Overall Website Score</h2>
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="white"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - auditResult.overall_score / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <div className="text-5xl font-bold">{auditResult.overall_score}</div>
                        <div className="text-sm opacity-90">out of 100</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xl opacity-90">
                    {getScoreLabel(auditResult.overall_score)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Category Scores */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
                <CardDescription>Performance across all categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'SEO Optimization', score: auditResult.seo_score, icon: Search },
                  { label: 'Performance & Speed', score: auditResult.performance_score, icon: Zap },
                  { label: 'Mobile Experience', score: auditResult.mobile_score, icon: Smartphone },
                  { label: 'Security', score: auditResult.security_score, icon: Shield },
                ].map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <category.icon className="w-5 h-5 text-slate-600" />
                        <span className="font-medium">{category.label}</span>
                      </div>
                      <span className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                        {category.score}
                      </span>
                    </div>
                    <Progress value={category.score} className="h-3" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Findings */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Key Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="critical" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="critical" className="gap-2">
                      <XCircle className="w-4 h-4" />
                      Critical ({auditResult.findings.critical.length})
                    </TabsTrigger>
                    <TabsTrigger value="warnings" className="gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Warnings ({auditResult.findings.warnings.length})
                    </TabsTrigger>
                    <TabsTrigger value="good" className="gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Good ({auditResult.findings.good.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="critical" className="space-y-3 mt-4">
                    {auditResult.findings.critical.length === 0 ? (
                      <p className="text-center text-slate-600 py-8">No critical issues found!</p>
                    ) : (
                      auditResult.findings.critical.map((finding, index) => (
                        <div key={index} className="flex gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-700">{finding}</p>
                        </div>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="warnings" className="space-y-3 mt-4">
                    {auditResult.findings.warnings.length === 0 ? (
                      <p className="text-center text-slate-600 py-8">No warnings found!</p>
                    ) : (
                      auditResult.findings.warnings.map((finding, index) => (
                        <div key={index} className="flex gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-700">{finding}</p>
                        </div>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="good" className="space-y-3 mt-4">
                    {auditResult.findings.good.length === 0 ? (
                      <p className="text-center text-slate-600 py-8">No positive findings yet</p>
                    ) : (
                      auditResult.findings.good.map((finding, index) => (
                        <div key={index} className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-700">{finding}</p>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
                <CardDescription>Action items to improve your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {auditResult.recommendations.map((rec, index) => (
                  <div key={index} className="p-5 rounded-lg border-2 border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          rec.priority === 'high' ? 'destructive' :
                          rec.priority === 'medium' ? 'default' :
                          'secondary'
                        }>
                          {rec.priority} priority
                        </Badge>
                        <span className="text-sm font-medium text-slate-600">{rec.category}</span>
                      </div>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        {rec.estimatedImpact} impact
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{rec.issue}</h4>
                    <p className="text-slate-600">{rec.solution}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStep('input');
                  setWebsiteUrl('');
                  setGoals([]);
                  setAuditResult(null);
                }}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Another Audit
              </Button>
              <Button
                onClick={() => router.push('/dashboard/audits')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
              >
                View All Audits
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
