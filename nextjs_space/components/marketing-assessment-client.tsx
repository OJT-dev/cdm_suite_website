
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  Download,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trackRedditLead } from '@/lib/reddit-tracking';
import { trackConversion } from '@/lib/analytics';

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; score: number }[];
  category: string;
}

const questions: Question[] = [
  {
    id: 'website_traffic',
    question: 'How much traffic does your website get monthly?',
    category: 'Traffic',
    options: [
      { value: 'none', label: 'Less than 1,000 visitors', score: 1 },
      { value: 'low', label: '1,000 - 5,000 visitors', score: 2 },
      { value: 'medium', label: '5,000 - 20,000 visitors', score: 3 },
      { value: 'high', label: '20,000+ visitors', score: 4 },
    ],
  },
  {
    id: 'conversion_rate',
    question: 'What\'s your website conversion rate?',
    category: 'Conversions',
    options: [
      { value: 'dont_know', label: 'I don\'t know', score: 0 },
      { value: 'very_low', label: 'Less than 1%', score: 1 },
      { value: 'low', label: '1% - 3%', score: 2 },
      { value: 'good', label: '3% - 5%', score: 3 },
      { value: 'excellent', label: 'More than 5%', score: 4 },
    ],
  },
  {
    id: 'social_media',
    question: 'How active is your social media presence?',
    category: 'Social Media',
    options: [
      { value: 'none', label: 'No social media presence', score: 0 },
      { value: 'minimal', label: 'Post occasionally (once a week or less)', score: 1 },
      { value: 'moderate', label: 'Regular posting (2-3 times a week)', score: 2 },
      { value: 'active', label: 'Daily engagement and content', score: 3 },
      { value: 'very_active', label: 'Multiple posts daily with strong engagement', score: 4 },
    ],
  },
  {
    id: 'email_marketing',
    question: 'Do you have an email marketing strategy?',
    category: 'Email Marketing',
    options: [
      { value: 'none', label: 'No email marketing at all', score: 0 },
      { value: 'basic', label: 'Small list, send occasionally', score: 1 },
      { value: 'growing', label: 'Growing list, regular newsletters', score: 2 },
      { value: 'strategic', label: 'Segmented campaigns with automation', score: 3 },
      { value: 'advanced', label: 'Advanced automation with personalization', score: 4 },
    ],
  },
  {
    id: 'seo',
    question: 'How would you rate your SEO efforts?',
    category: 'SEO',
    options: [
      { value: 'none', label: 'What\'s SEO?', score: 0 },
      { value: 'basic', label: 'Basic meta tags only', score: 1 },
      { value: 'moderate', label: 'Regular content with keywords', score: 2 },
      { value: 'good', label: 'Strategic content + technical SEO', score: 3 },
      { value: 'excellent', label: 'Comprehensive SEO strategy with analytics', score: 4 },
    ],
  },
  {
    id: 'paid_ads',
    question: 'What\'s your paid advertising situation?',
    category: 'Paid Ads',
    options: [
      { value: 'none', label: 'No paid advertising', score: 0 },
      { value: 'testing', label: 'Testing with small budget', score: 1 },
      { value: 'regular', label: 'Regular campaigns on 1-2 platforms', score: 2 },
      { value: 'multi', label: 'Multiple platforms with optimization', score: 3 },
      { value: 'advanced', label: 'Advanced targeting and retargeting', score: 4 },
    ],
  },
  {
    id: 'content',
    question: 'How often do you create new content?',
    category: 'Content',
    options: [
      { value: 'never', label: 'Rarely or never', score: 0 },
      { value: 'monthly', label: 'Once a month', score: 1 },
      { value: 'weekly', label: 'Weekly content', score: 2 },
      { value: 'multiple', label: 'Multiple times per week', score: 3 },
      { value: 'daily', label: 'Daily content across platforms', score: 4 },
    ],
  },
  {
    id: 'analytics',
    question: 'Do you track and analyze your marketing data?',
    category: 'Analytics',
    options: [
      { value: 'none', label: 'No tracking at all', score: 0 },
      { value: 'basic', label: 'Basic Google Analytics', score: 1 },
      { value: 'regular', label: 'Regular reporting and review', score: 2 },
      { value: 'data_driven', label: 'Data-driven decision making', score: 3 },
      { value: 'advanced', label: 'Advanced attribution and optimization', score: 4 },
    ],
  },
];

export function MarketingAssessmentClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', company: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const { toast } = useToast();

  const totalSteps = questions.length + 2; // questions + contact info + results
  const progress = ((step + 1) / totalSteps) * 100;

  const handleAnswerSelect = (value: string) => {
    setAnswers({ ...answers, [questions[step].id]: value });
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else if (step === questions.length - 1) {
      // Move to contact info step
      setStep(questions.length);
    } else if (step === questions.length) {
      // Submit assessment
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach((question) => {
      const answer = answers[question.id];
      const option = question.options.find((opt) => opt.value === answer);
      if (option) {
        totalScore += option.score;
      }
      maxScore += 4; // Max score per question
    });

    return Math.round((totalScore / maxScore) * 100);
  };

  const generateRecommendations = (finalScore: number) => {
    const recs: string[] = [];

    if (finalScore < 25) {
      recs.push('Build a strong digital foundation with a professional website');
      recs.push('Set up basic SEO and analytics tracking');
      recs.push('Start email marketing with lead magnets');
      recs.push('Create a content strategy for consistent publishing');
    } else if (finalScore < 50) {
      recs.push('Optimize your conversion funnel to increase ROI');
      recs.push('Implement marketing automation for efficiency');
      recs.push('Expand your content marketing efforts');
      recs.push('Start or scale your paid advertising campaigns');
    } else if (finalScore < 75) {
      recs.push('Fine-tune your attribution and analytics');
      recs.push('Implement advanced retargeting campaigns');
      recs.push('Develop a comprehensive social media strategy');
      recs.push('Create a customer loyalty program');
    } else {
      recs.push('Implement AI-powered personalization');
      recs.push('Expand into new marketing channels');
      recs.push('Develop strategic partnerships');
      recs.push('Focus on lifetime value optimization');
    }

    return recs;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const finalScore = calculateScore();
      const recs = generateRecommendations(finalScore);

      // Submit to API
      const response = await fetch('/api/marketing-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactInfo,
          responses: answers,
          score: finalScore,
          recommendations: recs,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit assessment');

      // Track lead conversion - dual tracking (client-side + server-side)
      trackRedditLead(contactInfo.email);
      trackConversion('marketing_assessment', undefined, 'USD', {
        email: contactInfo.email,
        score: finalScore,
        company: contactInfo.company,
      });

      setScore(finalScore);
      setRecommendations(recs);
      setIsComplete(true);
      setStep(totalSteps - 1);

      toast({
        title: 'Assessment Complete!',
        description: 'Your personalized report is ready. Check your email for the full analysis.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step < questions.length) {
      return !!answers[questions[step].id];
    } else if (step === questions.length) {
      return contactInfo.name && contactInfo.email;
    }
    return true;
  };

  return (
    <div className="container mx-auto px-4 py-20">
      {/* Header */}
      {!isComplete && (
        <div className="max-w-3xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4">
              <Sparkles className="inline-block mr-2 h-8 w-8 text-primary" />
              3-Minute Marketing Assessment
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover your marketing maturity score and get personalized recommendations
            </p>
          </motion.div>

          <Progress value={progress} className="h-2 mb-6" />
          <p className="text-center text-sm text-muted-foreground">
            Step {step + 1} of {totalSteps}
          </p>
        </div>
      )}

      {/* Questions */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!isComplete && step < questions.length && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">{questions[step].question}</CardTitle>
                  <CardDescription>Select the option that best describes your situation</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[questions[step].id]}
                    onValueChange={handleAnswerSelect}
                    className="space-y-3"
                  >
                    {questions[step].options.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-primary transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label
                          htmlFor={option.value}
                          className="flex-1 cursor-pointer text-base"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Contact Info Step */}
          {!isComplete && step === questions.length && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">Get Your Personalized Report</CardTitle>
                  <CardDescription>
                    Enter your details to receive your marketing assessment results and custom recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company Name (Optional)</Label>
                    <Input
                      id="company"
                      value={contactInfo.company}
                      onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
                      placeholder="Acme Inc."
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <Card className="border-2 border-primary">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  </div>
                  <CardTitle className="text-3xl">Your Marketing Maturity Score</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-7xl font-bold text-primary mb-4">{score}%</div>
                  <p className="text-xl text-muted-foreground mb-6">
                    {score < 25 && 'Foundation Building Stage'}
                    {score >= 25 && score < 50 && 'Growth Stage'}
                    {score >= 50 && score < 75 && 'Optimization Stage'}
                    {score >= 75 && 'Advanced Marketing Stage'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    Your Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-lg">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg">
                    We have sent a detailed report to <strong>{contactInfo.email}</strong> with:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>✅ Complete marketing audit</li>
                    <li>✅ Actionable improvement strategies</li>
                    <li>✅ Industry benchmarks</li>
                    <li>✅ Timeline and budget recommendations</li>
                  </ul>
                  <div className="flex gap-4 pt-4">
                    <Button size="lg" className="flex-1" asChild>
                      <a href="/contact">
                        <Mail className="mr-2 h-5 w-5" />
                        Schedule Strategy Call
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" className="flex-1">
                      <Download className="mr-2 h-5 w-5" />
                      Download PDF Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {!isComplete && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? (
                'Submitting...'
              ) : step === questions.length ? (
                <>
                  Get Results
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
