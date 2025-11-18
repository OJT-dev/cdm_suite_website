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
  Phone,
  Sparkles,
  ExternalLink
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
import TripwireFunnel from './tripwire-funnel';
import LoadingAnimation from '../loading-animation';

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
  const [step, setStep] = useState<'input' | 'analyzing' | 'tripwire' | 'results'>('input');
  const [formData, setFormData] = useState({
    websiteUrl: '',
    email: '',
    name: '',
    phone: '',
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
      
      // Show tripwire funnel before showing results
      setStep('tripwire');
      
      toast.success('Audit complete! Check your email for the full report.');
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

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
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
      <section className="pt-20 md:pt-24 pb-8 md:pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs md:text-sm">
              <Award className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Free Website Audit Tool
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 leading-tight px-2">
              Discover What's Holding Your
              <br className="hidden sm:block" />
              <span className="text-blue-600"> Website Back</span>
            </h1>
            
            <p className="text-base md:text-lg lg:text-xl text-slate-600 mb-6 md:mb-8 max-w-3xl mx-auto px-4">
              Get a complete analysis of your website's SEO, performance, mobile experience, and security. 
              Receive actionable insights in minutes—absolutely free.
            </p>

            {/* Authentication Status Banner */}
            {isAuthenticated ? (
              <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-full mb-6 md:mb-8 mx-4 max-w-full">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800 font-medium text-xs md:text-sm truncate">
                  Logged in as {session?.user?.name || session?.user?.email}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-full mb-6 md:mb-8 mx-4 max-w-full">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                <span className="text-blue-800 font-medium text-xs md:text-sm">
                  <Link href="/auth/login?redirect=auditor" className="hover:underline font-semibold">
                    Log in
                  </Link>
                  {' '}or{' '}
                  <Link href="/auth/signup" className="hover:underline font-semibold">
                    sign up
                  </Link>
                  {' '}to save results
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-3 md:gap-6 mb-8 md:mb-12 px-4">
              {[
                { icon: Search, label: 'SEO Analysis' },
                { icon: Zap, label: 'Performance' },
                { icon: Smartphone, label: 'Mobile' },
                { icon: Shield, label: 'Security' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-slate-700 text-sm md:text-base">
                  <item.icon className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
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

                      {/* Phone & Company */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2">
                            Phone Number <span className="text-xs text-gray-500 font-normal">(Optional - for priority support)</span>
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="(555) 123-4567"
                              value={formData.phone}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              className="pl-11 h-12"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            💡 Add your number for faster response from our team
                          </p>
                        </div>

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
              <LoadingAnimation 
                toolName="Website Audit"
                messages={[
                  '🔍 Checking SEO optimization...',
                  '⚡ Testing page speed & performance...',
                  '📱 Analyzing mobile responsiveness...',
                  '🔒 Scanning security vulnerabilities...',
                  '✨ Preparing your report...'
                ]}
                duration={5000}
              />
            )}

            {step === 'tripwire' && auditResult && (
              <TripwireFunnel
                websiteUrl={formData.websiteUrl}
                email={formData.email}
                name={formData.name || 'there'}
                overallScore={auditResult.overall_score}
                onComplete={() => setStep('results')}
              />
            )}

            {step === 'results' && auditResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Overall Score Card */}
                <Card className={`shadow-xl border-2 ${getScoreBg(auditResult.overall_score)}`}>
                  <CardContent className="pt-8 pb-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="text-center md:text-left">
                        <div className={`text-6xl font-bold mb-2 ${getScoreColor(auditResult.overall_score)}`}>
                          {auditResult.overall_score}
                          <span className="text-3xl">/100</span>
                        </div>
                        <div className="text-xl font-semibold text-slate-900 mb-1">
                          {getScoreLabel(auditResult.overall_score)}
                        </div>
                        <p className="text-slate-600">Overall Website Health</p>
                      </div>

                      <div className="flex-1 grid sm:grid-cols-2 gap-4 w-full">
                        {[
                          { label: 'SEO', score: auditResult.seo_score, icon: Search },
                          { label: 'Performance', score: auditResult.performance_score, icon: Zap },
                          { label: 'Mobile', score: auditResult.mobile_score, icon: Smartphone },
                          { label: 'Security', score: auditResult.security_score, icon: Shield },
                        ].map((item, index) => (
                          <div key={index} className="bg-white/80 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <item.icon className="w-4 h-4 text-slate-600" />
                                <span className="font-medium text-slate-900">{item.label}</span>
                              </div>
                              <span className={`font-bold ${getScoreColor(item.score)}`}>
                                {item.score}
                              </span>
                            </div>
                            <Progress value={item.score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Critical Issues */}
                {auditResult.findings.critical.length > 0 && (
                  <Card className="shadow-lg border-2 border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-800">
                        <XCircle className="w-6 h-6" />
                        Critical Issues ({auditResult.findings.critical.length})
                      </CardTitle>
                      <CardDescription>These issues need immediate attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {auditResult.findings.critical.map((issue, index) => (
                          <li key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Warnings */}
                {auditResult.findings.warnings.length > 0 && (
                  <Card className="shadow-lg border-2 border-yellow-200 bg-yellow-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="w-6 h-6" />
                        Warnings ({auditResult.findings.warnings.length})
                      </CardTitle>
                      <CardDescription>These issues should be addressed soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {auditResult.findings.warnings.map((issue, index) => (
                          <li key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Good Findings */}
                {auditResult.findings.good.length > 0 && (
                  <Card className="shadow-lg border-2 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle2 className="w-6 h-6" />
                        What's Working Well ({auditResult.findings.good.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {auditResult.findings.good.map((item, index) => (
                          <li key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Recommended Actions</CardTitle>
                    <CardDescription>
                      Prioritized improvements to boost your website's performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="high">High Priority</TabsTrigger>
                        <TabsTrigger value="medium">Medium</TabsTrigger>
                        <TabsTrigger value="low">Low</TabsTrigger>
                      </TabsList>

                      {['all', 'high', 'medium', 'low'].map((priority) => (
                        <TabsContent key={priority} value={priority} className="space-y-4 mt-6">
                          {auditResult.recommendations
                            .filter(rec => priority === 'all' || rec.priority === priority)
                            .map((rec, index) => (
                              <div key={index} className="border-l-4 border-blue-600 bg-slate-50 p-6 rounded-r-lg">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <Badge className={
                                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    }>
                                      {rec.priority.toUpperCase()} PRIORITY
                                    </Badge>
                                    <h4 className="text-lg font-semibold text-slate-900 mt-2">
                                      {rec.category}: {rec.issue}
                                    </h4>
                                  </div>
                                  <Badge variant="outline" className="whitespace-nowrap">
                                    Impact: {rec.estimatedImpact}
                                  </Badge>
                                </div>
                                <p className="text-slate-700 leading-relaxed">{rec.solution}</p>
                              </div>
                            ))}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Suggested Services */}
                {auditResult.suggestedServices.length > 0 && (
                  <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
                    <CardHeader>
                      <CardTitle>How We Can Help</CardTitle>
                      <CardDescription>
                        Based on your audit, here are our recommended services
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {auditResult.suggestedServices.map((service, index) => (
                        <div key={index} className="bg-white rounded-lg p-6 border-2 border-slate-200 hover:border-blue-400 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-slate-900 mb-2">
                                {service.name}
                              </h4>
                              <p className="text-slate-600">{service.reason}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">{service.price}</div>
                            </div>
                          </div>
                          <Link href={`/services/${service.slug}?ref=audit`}>
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                              Learn More
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* CTA */}
                <Card className="shadow-lg bg-gradient-to-r from-accent to-secondary text-white">
                  <CardContent className="pt-8 pb-8 text-center">
                    <h3 className="text-3xl font-bold mb-4">Ready to Fix These Issues?</h3>
                    <p className="text-lg mb-6 opacity-90">
                      Let's turn these insights into real results. Book a free consultation with our team.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/contact?source=audit">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-bold">
                          Schedule Free Consultation
                        </Button>
                      </Link>
                      <a href="tel:8622727623">
                        <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                          <Phone className="w-4 h-4 mr-2" />
                          Call (862) 272-7623
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Confirmation */}
                <Card className="shadow-lg bg-green-50 border-2 border-green-200">
                  <CardContent className="pt-6 pb-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Mail className="w-6 h-6 text-green-600" />
                      <h4 className="text-lg font-semibold text-green-900">
                        Full Report Sent to Your Email
                      </h4>
                    </div>
                    <p className="text-green-700">
                      We've sent a detailed PDF report to <strong>{formData.email}</strong> with all findings and recommendations.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
