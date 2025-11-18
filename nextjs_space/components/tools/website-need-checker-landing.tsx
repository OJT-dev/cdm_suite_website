
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  Globe,
  Zap,
  Target,
  BarChart3,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { trackRedditLead } from "@/lib/reddit-tracking";
import { trackConversion } from "@/lib/analytics";
import { cn } from '@/lib/utils';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

interface Assessment {
  hasWebsite: string;
  industry: string;
  businessAge: string;
  customerType: string;
  currentLeadGen: string;
  monthlyRevenue: string;
  competitors: string;
  goals: string[];
}

interface LeadInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export default function WebsiteNeedCheckerLanding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [assessment, setAssessment] = useState<Assessment>({
    hasWebsite: '',
    industry: '',
    businessAge: '',
    customerType: '',
    currentLeadGen: '',
    monthlyRevenue: '',
    competitors: '',
    goals: [],
  });
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({
    name: '',
    email: '',
    phone: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  const calculateScore = () => {
    let score = 0;
    let needLevel: 'critical' | 'high' | 'moderate' | 'low' = 'low';

    // Has website check
    if (assessment.hasWebsite === 'no') score += 30;
    else if (assessment.hasWebsite === 'outdated') score += 25;

    // Industry relevance
    if (['retail', 'professional-services', 'restaurant'].includes(assessment.industry)) {
      score += 15;
    }

    // Business age
    if (assessment.businessAge !== 'startup') score += 10;

    // Customer type
    if (assessment.customerType === 'b2c') score += 10;
    else if (assessment.customerType === 'both') score += 15;

    // Current lead generation
    if (['referrals', 'none'].includes(assessment.currentLeadGen)) {
      score += 15;
    }

    // Revenue impact
    if (assessment.monthlyRevenue === '10k+') score += 10;
    else if (assessment.monthlyRevenue === '5k-10k') score += 8;

    // Competitor pressure
    if (assessment.competitors === 'most') score += 10;
    else if (assessment.competitors === 'some') score += 5;

    // Goals alignment
    score += Math.min(assessment.goals.length * 3, 15);

    // Determine need level
    if (score >= 80) needLevel = 'critical';
    else if (score >= 60) needLevel = 'high';
    else if (score >= 40) needLevel = 'moderate';
    else needLevel = 'low';

    return { score, needLevel };
  };

  const calculateROI = () => {
    const revenueMap: { [key: string]: number } = {
      '0-1k': 500,
      '1k-5k': 3000,
      '5k-10k': 7500,
      '10k+': 15000,
    };

    const monthlyRevenue = revenueMap[assessment.monthlyRevenue] || 3000;
    
    // Conservative estimate: 20-30% revenue increase with professional website
    const conversionBoost = 0.25;
    const monthlyGain = monthlyRevenue * conversionBoost;
    const yearlyGain = monthlyGain * 12;
    
    // Website investment (CDM Suite builder)
    const websiteInvestment = 1500; // One-time
    const monthlyMaintenance = 99; // Monthly subscription
    const yearlyInvestment = websiteInvestment + (monthlyMaintenance * 12);
    
    const roi = ((yearlyGain - yearlyInvestment) / yearlyInvestment) * 100;

    return {
      monthlyGain: Math.round(monthlyGain),
      yearlyGain: Math.round(yearlyGain),
      investment: yearlyInvestment,
      roi: Math.round(roi),
      breakEvenMonths: Math.ceil(websiteInvestment / monthlyGain),
    };
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!leadInfo.name || !leadInfo.email) {
      toast.error('Please provide your name and email to see results');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit lead to public API endpoint
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadInfo.name,
          email: leadInfo.email,
          phone: leadInfo.phone || null,
          company: leadInfo.company || null,
          source: 'website-need-checker',
          interest: 'AI Website Builder',
          notes: `Website Need Assessment Results:\n\nScore: ${calculateScore().score}/100\nNeed Level: ${calculateScore().needLevel.toUpperCase()}\n\nAssessment Details:\n${JSON.stringify(assessment, null, 2)}`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Track lead conversion
        trackRedditLead(leadInfo.email);
        trackConversion('website_need_checker', undefined, 'USD', { email: leadInfo.email });
        
        setShowResults(true);
        toast.success('Assessment complete! Scroll down to see your results.');
        
        // Smooth scroll to results
        setTimeout(() => {
          window.scrollTo({ top: 600, behavior: 'smooth' });
        }, 100);
      } else {
        console.error('API error:', data);
        toast.error(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setAssessment((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Do you currently have a website?</h3>
            <RadioGroup
              value={assessment.hasWebsite}
              onValueChange={(value) => setAssessment({ ...assessment, hasWebsite: value })}
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary cursor-pointer">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="cursor-pointer flex-1">
                  No, I don't have a website
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary cursor-pointer">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer flex-1">
                  Yes, but it's outdated or not working well
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary cursor-pointer">
                <RadioGroupItem value="modern" id="modern" />
                <Label htmlFor="modern" className="cursor-pointer flex-1">
                  Yes, I have a modern, functional website
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">What industry are you in?</h3>
            <RadioGroup
              value={assessment.industry}
              onValueChange={(value) => setAssessment({ ...assessment, industry: value })}
            >
              {[
                { value: 'retail', label: 'Retail / E-commerce' },
                { value: 'professional-services', label: 'Professional Services (Law, Consulting, etc.)' },
                { value: 'restaurant', label: 'Restaurant / Food Service' },
                { value: 'health', label: 'Healthcare / Wellness' },
                { value: 'construction', label: 'Construction / Home Services' },
                { value: 'other', label: 'Other' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary cursor-pointer"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">How long have you been in business?</h3>
            <RadioGroup
              value={assessment.businessAge}
              onValueChange={(value) => setAssessment({ ...assessment, businessAge: value })}
            >
              {[
                { value: 'startup', label: 'Less than 1 year' },
                { value: '1-3', label: '1-3 years' },
                { value: '3-5', label: '3-5 years' },
                { value: '5+', label: 'More than 5 years' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary cursor-pointer"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Who are your primary customers?</h3>
            <RadioGroup
              value={assessment.customerType}
              onValueChange={(value) => setAssessment({ ...assessment, customerType: value })}
            >
              {[
                { value: 'b2c', label: 'Individual consumers (B2C)' },
                { value: 'b2b', label: 'Other businesses (B2B)' },
                { value: 'both', label: 'Both consumers and businesses' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary cursor-pointer"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">How do you currently get new customers?</h3>
            <RadioGroup
              value={assessment.currentLeadGen}
              onValueChange={(value) => setAssessment({ ...assessment, currentLeadGen: value })}
            >
              {[
                { value: 'referrals', label: 'Word of mouth / Referrals only' },
                { value: 'social', label: 'Social media' },
                { value: 'ads', label: 'Paid advertising' },
                { value: 'mixed', label: 'Multiple channels' },
                { value: 'none', label: 'Struggling to get customers' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary cursor-pointer"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">What's your approximate monthly revenue?</h3>
            <RadioGroup
              value={assessment.monthlyRevenue}
              onValueChange={(value) => setAssessment({ ...assessment, monthlyRevenue: value })}
            >
              {[
                { value: '0-1k', label: 'Less than $1,000' },
                { value: '1k-5k', label: '$1,000 - $5,000' },
                { value: '5k-10k', label: '$5,000 - $10,000' },
                { value: '10k+', label: 'More than $10,000' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary cursor-pointer"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Do your competitors have websites?</h3>
            <RadioGroup
              value={assessment.competitors}
              onValueChange={(value) => setAssessment({ ...assessment, competitors: value })}
            >
              {[
                { value: 'most', label: 'Yes, most of them do' },
                { value: 'some', label: 'Some of them do' },
                { value: 'few', label: 'Very few or none' },
                { value: 'unsure', label: 'Not sure' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary cursor-pointer"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">What are your main business goals?</h3>
              <p className="text-sm text-muted-foreground mb-4">(Select all that apply)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'more-customers', label: 'Get more customers', icon: Users },
                  { value: 'increase-revenue', label: 'Increase revenue', icon: TrendingUp },
                  { value: 'build-credibility', label: 'Build credibility', icon: Target },
                  { value: 'online-presence', label: 'Establish online presence', icon: Globe },
                  { value: 'compete', label: 'Compete better', icon: BarChart3 },
                  { value: 'automate', label: 'Automate processes', icon: Zap },
                ].map(({ value, label, icon: Icon }) => (
                  <div
                    key={value}
                    onClick={() => toggleGoal(value)}
                    className={cn(
                      'flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all',
                      assessment.goals.includes(value)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded border flex items-center justify-center',
                        assessment.goals.includes(value)
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      )}
                    >
                      {assessment.goals.includes(value) && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="flex-1 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">Get Your Personalized Results</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={leadInfo.name}
                    onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={leadInfo.email}
                    onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                    placeholder="john@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={leadInfo.phone}
                    onChange={(e) => setLeadInfo({ ...leadInfo, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={leadInfo.company}
                    onChange={(e) => setLeadInfo({ ...leadInfo, company: e.target.value })}
                    placeholder="Acme Inc."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const { score, needLevel } = calculateScore();
  const roiData = calculateROI();

  const getNeedLevelInfo = () => {
    switch (needLevel) {
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'CRITICAL NEED',
          message: 'Your business urgently needs a professional website to remain competitive and capture growth opportunities.',
        };
      case 'high':
        return {
          icon: XCircle,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          title: 'HIGH PRIORITY',
          message: 'A professional website would significantly benefit your business growth and customer acquisition.',
        };
      case 'moderate':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'MODERATE NEED',
          message: 'A website could help improve your business visibility and streamline customer interactions.',
        };
      case 'low':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          title: 'LOW PRIORITY',
          message: 'Your current setup seems adequate, but a modern website could still provide additional benefits.',
        };
    }
  };

  const needInfo = getNeedLevelInfo();
  const NeedIcon = needInfo.icon;

  return (
    <main>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                FREE Assessment Tool
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Does Your Business Need a Website?
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Take our 2-minute assessment to discover if a website could help you grow your business,
                plus calculate your potential ROI and get personalized recommendations.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Assessment Card */}
        {!showResults && (
          <section className="pb-20 px-4">
            <div className="container mx-auto max-w-2xl">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle>Website Need Assessment</CardTitle>
                    <Badge variant="outline">
                      Step {step} of {totalSteps}
                    </Badge>
                  </div>
                  <Progress value={progress} className="mb-2" />
                  <CardDescription>
                    {step < totalSteps
                      ? 'Answer honestly for the most accurate results'
                      : 'Final step - Enter your details to see personalized results'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderStep()}

                  <div className="flex gap-3 mt-8">
                    {step > 1 && (
                      <Button variant="outline" onClick={handleBack} className="flex-1">
                        Back
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      disabled={
                        !assessment[
                          Object.keys(assessment)[step - 1] as keyof Assessment
                        ] ||
                        (step === totalSteps && (!leadInfo.name || !leadInfo.email)) ||
                        isSubmitting
                      }
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        'Analyzing...'
                      ) : step === totalSteps ? (
                        <>
                          See My Results
                          <Sparkles className="ml-2 w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Results Section */}
        {showResults && (
          <section className="pb-20 px-4">
            <div className="container mx-auto max-w-5xl space-y-8">
              {/* Overall Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className={cn('border-2', needInfo.border, needInfo.bg)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={cn('p-3 rounded-full', needInfo.bg)}>
                        <NeedIcon className={cn('w-8 h-8', needInfo.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold">{needInfo.title}</h2>
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            Score: {score}/100
                          </Badge>
                        </div>
                        <p className="text-lg text-muted-foreground">{needInfo.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ROI Calculation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Potential ROI with a Professional Website
                    </CardTitle>
                    <CardDescription>
                      Based on your monthly revenue and industry benchmarks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Monthly Gain</p>
                        <p className="text-2xl font-bold text-green-600">
                          +${roiData.monthlyGain.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Yearly Gain</p>
                        <p className="text-2xl font-bold text-green-600">
                          +${roiData.yearlyGain.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
                        <p className="text-2xl font-bold">${roiData.investment.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">ROI</p>
                        <p className="text-2xl font-bold text-primary">{roiData.roi}%</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      <strong>Break-even in {roiData.breakEvenMonths} months.</strong> After that,
                      it's pure profit growth for your business.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* What You're Missing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>What You're Missing Without a Website</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          icon: Users,
                          title: '24/7 Lead Generation',
                          description: 'Capture customers even when you sleep',
                        },
                        {
                          icon: Target,
                          title: 'Professional Credibility',
                          description: '81% of consumers research online before buying',
                        },
                        {
                          icon: Globe,
                          title: 'Expanded Reach',
                          description: 'Get found by customers searching online',
                        },
                        {
                          icon: Zap,
                          title: 'Automated Sales',
                          description: 'Showcase services and close deals automatically',
                        },
                        {
                          icon: BarChart3,
                          title: 'Competitive Advantage',
                          description: 'Stand out from competitors without websites',
                        },
                        {
                          icon: DollarSign,
                          title: 'Lower Customer Acquisition Cost',
                          description: 'Organic traffic is cheaper than paid ads',
                        },
                      ].map((item, index) => (
                        <div key={index} className="flex gap-3 p-4 bg-muted rounded-lg">
                          <item.icon className="w-6 h-6 text-primary flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold mb-1">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* CTA Section - AI Website Builder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-purple-500/5">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-6">
                      <div>
                        <Badge variant="secondary" className="mb-3">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Recommended Solution
                        </Badge>
                        <h2 className="text-3xl font-bold mb-3">
                          Get Your Website Built in 24 Hours with AI
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                          Skip the 6-week wait and $5,000+ cost of traditional web development. Our AI
                          Website Builder creates a professional, custom website tailored to your
                          business in just one day.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        <div className="p-4 bg-white rounded-lg border">
                          <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                          <h4 className="font-semibold mb-1">Lightning Fast</h4>
                          <p className="text-sm text-muted-foreground">
                            Live in 24 hours, not weeks
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                          <h4 className="font-semibold mb-1">Affordable</h4>
                          <p className="text-sm text-muted-foreground">
                            70% less than traditional dev
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                          <h4 className="font-semibold mb-1">AI-Powered</h4>
                          <p className="text-sm text-muted-foreground">
                            Custom design, not templates
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" onClick={() => router.push('/builder')} className="text-lg">
                          <Sparkles className="mr-2 w-5 h-5" />
                          Start Building My Website
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => router.push('/contact')}
                          className="text-lg"
                        >
                          <Phone className="mr-2 w-5 h-5" />
                          Talk to an Expert
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        🎁 <strong>Special Offer:</strong> Mention this assessment and get 20% off
                        your first month!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Alternative: Custom Development */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-semibold">
                        Need Something More Custom?
                      </h3>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        If you need advanced features, custom integrations, or enterprise-level
                        functionality, our development team can build a fully custom solution.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button variant="outline" asChild>
                          <a href="/services/web-design">View Custom Development Services</a>
                        </Button>
                        <Button variant="outline" asChild>
                          <a href="/contact">Schedule a Consultation</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 border-2 border-background flex items-center justify-center text-white font-semibold"
                        >
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      Join <strong>500+</strong> businesses we've helped grow online
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Benefits Section (for people who haven't started) */}
        {!showResults && (
          <section className="pb-20 px-4 bg-muted/50">
            <div className="container mx-auto max-w-6xl pt-16">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Thousands of Businesses Trust CDM Suite
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: TrendingUp,
                    title: 'Proven Results',
                    description:
                      'Our clients see an average 40% increase in leads within the first 3 months',
                  },
                  {
                    icon: Zap,
                    title: 'Fast Deployment',
                    description:
                      'AI-powered website creation gets you online in 24 hours, not months',
                  },
                  {
                    icon: Target,
                    title: 'Full Support',
                    description:
                      'Dedicated account manager and 24/7 support to ensure your success',
                  },
                ].map((benefit, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 text-center">
                      <benefit.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  );
}
