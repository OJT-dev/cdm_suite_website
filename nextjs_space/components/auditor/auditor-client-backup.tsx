

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
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
  Mail,
  Building2,
  Globe,
  ArrowRight,
  Award,
  BarChart3,
  RefreshCw,
  LogIn,
  UserPlus,
  Save,
  Sparkles
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

export default function AuditorClient() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [step, setStep] = useState<'input' | 'analyzing' | 'results'>('input');
  const [formData, setFormData] = useState({
    websiteUrl: '',
    email: '',
    name: '',
    company: '',
    goals: [] as string[],
  });
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (isAuthenticated && session?.user?.email) {
      setFormData(prev => ({
        ...prev,
        email: session.user?.email || '',
        name: session.user?.name || ''
      }));
    }
  }, [isAuthenticated, session]);

  const goals = [
    { id: 'increase-traffic', label: 'Increase Website Traffic', icon: TrendingUp },
    { id: 'improve-seo', label: 'Improve SEO Ranking', icon: Search },
    { id: 'generate-leads', label: 'Generate More Leads', icon: Target },
    { id: 'boost-sales', label: 'Boost Online Sales', icon: BarChart3 },
    { id: 'mobile-optimization', label: 'Mobile Optimization', icon: Smartphone },
    { id: 'faster-loading', label: 'Faster Load Times', icon: Zap },
  ];

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.websiteUrl || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setStep('analyzing');

    try {
      const response = await fetch('/api/auditor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.id,
          isAuthenticated
        }),
      });

      if (!response.ok) throw new Error('Audit failed');

      const result = await response.json();
      setAuditResult(result.audit);
      setStep('results');
      
      if (isAuthenticated) {
        toast.success('Audit complete! Results saved to your dashboard.');
      } else {
        toast.success('Audit complete! Check your email for the full report.');
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Award className="w-3 h-3 mr-1" />
              Free Website Audit Tool
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900">
              Discover What's Holding Your
              <br />
              <span className="text-blue-600">Website Back</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Get a complete analysis of your website's SEO, performance, mobile experience, and security. 
              Receive actionable insights in minutes—absolutely free.
            </p>

            {/* Authentication Status Banner */}
            {isAuthenticated ? (
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-full mb-8">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Logged in as {session?.user?.name || session?.user?.email} • Results will be saved to your dashboard
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-full mb-8">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  <Link href="/auth/login?redirect=auditor" className="hover:underline font-semibold">
                    Log in
                  </Link>
                  {' '}or{' '}
                  <Link href="/auth/signup" className="hover:underline font-semibold">
                    sign up
                  </Link>
                  {' '}to save your audit results
                </span>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {[
                { icon: Search, label: 'SEO Analysis' },
                { icon: Zap, label: 'Performance Check' },
                { icon: Smartphone, label: 'Mobile-Friendly' },
                { icon: Shield, label: 'Security Scan' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-slate-700">
                  <item.icon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl">Start Your Free Website Audit</CardTitle>
                    <CardDescription className="text-base">
                      No credit card required. Results delivered instantly.
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
                            value={formData.websiteUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                            className="pl-11 h-12 text-base"
                            required
                          />
                        </div>
                      </div>

                      {/* Email & Name */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-base font-semibold">
                            Email Address <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@company.com"
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="pl-11 h-12"
                              required
                              disabled={isAuthenticated}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-base font-semibold">
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Smith"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="h-12"
                          />
                        </div>
                      </div>

                      {/* Company */}
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-base font-semibold">
                          Company Name
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            id="company"
                            type="text"
                            placeholder="Your Company"
                            value={formData.company}
                            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                            className="pl-11 h-12"
                          />
                        </div>
                      </div>

                      {/* Goals */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">
                          What are your main goals? (Select all that apply)
                        </Label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {goals.map((goal) => (
                            <button
                              key={goal.id}
                              type="button"
                              onClick={() => handleGoalToggle(goal.id)}
                              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                formData.goals.includes(goal.id)
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <goal.icon className={`w-5 h-5 ${
                                formData.goals.includes(goal.id) ? 'text-blue-600' : 'text-slate-400'
                              }`} />
                              <span className={`text-sm font-medium ${
                                formData.goals.includes(goal.id) ? 'text-blue-900' : 'text-slate-700'
                              }`}>
                                {goal.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            Get My Free Audit
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-slate-500">
                        By submitting this form, you agree to receive marketing communications from CDM Suite.
                        You can unsubscribe at any time.
                      </p>
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
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
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
                {/* Save Results CTA - Only show if not authenticated */}
                {!isAuthenticated && (
                  <Card className="shadow-xl border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardContent className="py-6">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Save className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 mb-1">
                              Save Your Audit Results
                            </h3>
                            <p className="text-gray-600 text-sm">
                              Create a free account to track your progress over time and access personalized recommendations
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                          <Link href="/auth/login?redirect=auditor&audit=true">
                            <Button variant="outline" className="gap-2">
                              <LogIn className="w-4 h-4" />
                              Log In
                            </Button>
                          </Link>
                          <Link href="/auth/signup">
                            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 gap-2">
                              <UserPlus className="w-4 h-4" />
                              Sign Up Free
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Overall Score */}
                <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                  <CardContent className="pt-8 pb-8">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Your Website Score</h2>
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
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle>Detailed Breakdown</CardTitle>
                    <CardDescription>See how your website performs in each category</CardDescription>
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
                <Card className="shadow-xl border-0">
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
                        {auditResult.findings.critical.map((finding, index) => (
                          <div key={index} className="flex gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700">{finding}</p>
                          </div>
                        ))}
                      </TabsContent>
                      
                      <TabsContent value="warnings" className="space-y-3 mt-4">
                        {auditResult.findings.warnings.map((finding, index) => (
                          <div key={index} className="flex gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700">{finding}</p>
                          </div>
                        ))}
                      </TabsContent>
                      
                      <TabsContent value="good" className="space-y-3 mt-4">
                        {auditResult.findings.good.map((finding, index) => (
                          <div key={index} className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-700">{finding}</p>
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Recommendations with Service Upsells */}
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle>Personalized Recommendations</CardTitle>
                    <CardDescription>Action items to improve your website performance</CardDescription>
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
                        <p className="text-slate-600 mb-3">{rec.solution}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Suggested Services */}
                {auditResult.suggestedServices.length > 0 && (
                  <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-50 to-blue-50">
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">Ready to Take Action?</CardTitle>
                      <CardDescription className="text-base">
                        Based on your audit, here are our recommended services to help you improve
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {auditResult.suggestedServices.map((service, index) => (
                          <div key={index} className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-400 transition-all hover:shadow-lg">
                            <h4 className="font-bold text-xl mb-2">{service.name}</h4>
                            <p className="text-slate-600 text-sm mb-4">{service.reason}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                              <Button asChild size="sm">
                                <a href={`/services/${service.slug}`}>
                                  Learn More
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 text-center">
                        <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-blue-700">
                          <a href="/contact">
                            Schedule a Free Consultation
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </a>
                        </Button>
                        <p className="text-sm text-slate-600 mt-4">
                          Want to discuss these results? Our experts are ready to help.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Email Confirmation */}
                <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 rounded-full">
                    <Mail className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      Full report sent to {formData.email}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
