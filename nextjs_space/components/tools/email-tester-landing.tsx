"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, TrendingUp, AlertCircle, CheckCircle, Star, ArrowRight, Send, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { trackRedditLead } from "@/lib/reddit-tracking";
import { trackConversion } from "@/lib/analytics";
import Link from "next/link";
import LoadingAnimation from "../loading-animation";
import FOMONotifications from "../fomo-notifications";

interface EmailResult {
  openRatePrediction: number;
  spamScore: number;
  characterCount: number;
  wordCount: number;
  hasEmoji: boolean;
  hasNumber: boolean;
  hasPersonalization: boolean;
  recommendations: string[];
  strengths: string[];
  warnings: string[];
}

const EmailTesterLanding = () => {
  const [subjectLine, setSubjectLine] = useState("");
  const [result, setResult] = useState<EmailResult | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showTripwire, setShowTripwire] = useState(false);
  const [tripwireOffer, setTripwireOffer] = useState<any>(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectLine) {
      toast.error("Please enter a subject line");
      return;
    }

    setIsAnalyzing(true);

    // Generate mock result with loading animation
    setTimeout(() => {
      const characterCount = subjectLine.length;
      const wordCount = subjectLine.split(" ").length;
      const hasEmoji = /[\u{1F600}-\u{1F64F}]/u.test(subjectLine);
      const hasNumber = /\d/.test(subjectLine);
      const hasPersonalization = /\{|\[|name|your|you\}/i.test(subjectLine);

      let openRate = 15;
      if (characterCount >= 30 && characterCount <= 50) openRate += 10;
      if (hasEmoji) openRate += 5;
      if (hasNumber) openRate += 8;
      if (hasPersonalization) openRate += 12;
      if (subjectLine.includes("free") || subjectLine.includes("!")) openRate -= 5;

      openRate = Math.max(10, Math.min(35, openRate));

      const mockResult: EmailResult = {
        openRatePrediction: openRate,
        spamScore: Math.random() > 0.7 ? 35 : 12,
        characterCount,
        wordCount,
        hasEmoji,
        hasNumber,
        hasPersonalization,
        recommendations: [
          characterCount < 30 ? "Increase length to 30-50 characters for better open rates" : null,
          characterCount > 60 ? "Shorten to under 60 characters" : null,
          !hasPersonalization ? "Add personalization like {First Name}" : null,
          !hasNumber ? "Consider adding a number for specificity" : null,
          subjectLine.includes("!!!") ? "Remove excessive punctuation" : null
        ].filter(Boolean) as string[],
        strengths: [
          characterCount >= 30 && characterCount <= 50 ? "Optimal length" : null,
          hasPersonalization ? "Includes personalization" : null,
          hasNumber ? "Includes specific numbers" : null,
          hasEmoji ? "Eye-catching emoji" : null
        ].filter(Boolean) as string[],
        warnings: [
          subjectLine.toLowerCase().includes("free") ? "Spam trigger word: 'free'" : null,
          subjectLine.includes("!!!") ? "Too many exclamation marks" : null,
          characterCount > 60 ? "Too long for mobile devices" : null
        ].filter(Boolean) as string[]
      };

      setResult(mockResult);
      setShowLeadForm(true);
      setIsAnalyzing(false);
    }, 3500);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast.error("Please enter your name and email");
      return;
    }
    
    try {
      const response = await fetch('/api/send-tool-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          phone: phone || null,
          toolName: 'Email Subject Line Tester',
          toolData: { subjectLine },
          results: result
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Track lead conversion
        trackRedditLead(email);
        trackConversion('email_tester', undefined, 'USD', { email });
        
        setTripwireOffer(data.tripwireOffer);
        setShowTripwire(true);
        setShowLeadForm(false);
        toast.success("✅ Your email marketing tips have been sent!");
      } else {
        toast.error("Failed to send tips. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send tips. Please try again.");
    }
  };

  const handleTripwireCheckout = async () => {
    if (!tripwireOffer) return;
    
    setProcessingCheckout(true);
    
    try {
      const response = await fetch("/api/create-tripwire-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerName: tripwireOffer.offerName,
          amount: tripwireOffer.discountPrice,
          originalPrice: tripwireOffer.originalPrice,
          customerEmail: email,
          customerName: name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        toast.error("Failed to create checkout session. Please try again.");
        setProcessingCheckout(false);
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to create checkout session. Please try again.");
      setProcessingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-primary to-charcoal">
      <FOMONotifications />
      {isAnalyzing && (
        <LoadingAnimation
          toolName="Subject Line"
          duration={3500}
        />
      )}
      
      <section className="pt-20 sm:pt-24 md:pt-32 pb-6 sm:pb-8 md:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 rounded-full blur-[80px]"></div>
        </div>

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-none sm:backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <Mail className="h-5 w-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">Boost Your Email Open Rates</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Will Anyone
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Open Your Email?
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed font-semibold">
              Test your subject line and get an instant open rate prediction before you hit send.
            </p>
          </motion.div>

          {/* Tester Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleTest} className="space-y-6">
                  <div>
                    <Label htmlFor="subject" className="text-gray-900 font-semibold text-lg mb-3 block">
                      Your Email Subject Line
                    </Label>
                    <Textarea
                      id="subject"
                      placeholder="e.g., {FirstName}, you won't believe what we just launched..."
                      value={subjectLine}
                      onChange={(e) => setSubjectLine(e.target.value)}
                      className="text-lg min-h-[100px]"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      💡 Tip: Use {"{FirstName}"} or {"{Name}"} for personalization
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl"
                  >
                    Test My Subject Line
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto space-y-6 sm:space-y-8"
            >
              {/* Open Rate Prediction */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-none sm:backdrop-blur-sm border-2 border-purple-500/20">
                <CardContent className="p-8 text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">Predicted Open Rate</h2>
                  <div className="text-8xl font-bold mb-4">
                    <span className={result.openRatePrediction >= 25 ? "text-green-500" : result.openRatePrediction >= 18 ? "text-yellow-500" : "text-red-500"}>
                      {result.openRatePrediction}%
                    </span>
                  </div>
                  <Progress value={result.openRatePrediction * 2} className="h-3 mb-4" />
                  <p className="text-base sm:text-lg md:text-xl text-gray-300">
                    Industry average is 21%. {result.openRatePrediction >= 21 ? "You're above average! 🎉" : "Let's improve this."}
                  </p>
                </CardContent>
              </Card>

              {/* Analysis Grid */}
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <h3 className="text-xl font-bold text-white">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-green-500">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-500/10 border-yellow-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="h-6 w-6 text-yellow-500" />
                      <h3 className="text-xl font-bold text-white">Warnings</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.warnings.length > 0 ? result.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-yellow-500">⚠</span>
                          <span>{warning}</span>
                        </li>
                      )) : (
                        <li className="text-gray-300">No warnings! 🎉</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-6 w-6 text-blue-400" />
                      <h3 className="text-xl font-bold text-white">Quick Stats</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Character Count</p>
                        <p className="text-2xl font-bold text-white">{result.characterCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Spam Score</p>
                        <p className="text-2xl font-bold text-white">{result.spamScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">How to Improve</h3>
                    <ul className="space-y-3">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-300">
                          <span className="text-purple-400 font-bold">{index + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Lead Capture */}
              {showLeadForm && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl p-8 max-w-2xl mx-auto"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="h-6 w-6 text-purple-500" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Want 50 Proven Subject Line Templates?
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Get our complete guide to writing subject lines that get 2-3x higher open rates. Plus, schedule a free email marketing consultation.
                  </p>
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Your Name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="text-lg"
                    />
                    <Input
                      type="email"
                      placeholder="Your Email Address *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="text-lg"
                    />
                    <Input
                      type="tel"
                      placeholder="Phone Number (Optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-lg"
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 text-lg"
                    >
                      Send Me the Templates
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Plus get a free 30-minute email marketing consultation ($500 value)
                  </p>
                </motion.div>
              )}

              {/* Tripwire Upsell */}
              {showTripwire && tripwireOffer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl"
                >
                  <div className="text-center mb-6">
                    <div className="inline-block bg-red-500 text-white font-bold text-sm px-4 py-2 rounded-full mb-4">
                      {tripwireOffer.urgency}
                    </div>
                    <h2 className="text-4xl font-bold mb-3">
                      🎉 Check Your Email!
                    </h2>
                    <p className="text-xl">
                      Your subject line templates are on their way. But before you go...
                    </p>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                    <h3 className="text-3xl font-bold mb-3">{tripwireOffer.title}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-5xl font-bold">${tripwireOffer.discountPrice}</span>
                      <div>
                        <span className="text-xl line-through opacity-75">${tripwireOffer.originalPrice}</span>
                        <span className="ml-2 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                          Save ${tripwireOffer.savings}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {tripwireOffer.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Button
                      size="lg"
                      className="bg-white hover:bg-gray-100 text-purple-600 font-bold py-6 text-lg w-full"
                      onClick={handleTripwireCheckout}
                      disabled={processingCheckout}
                    >
                      {processingCheckout ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {tripwireOffer.cta}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-6 text-lg w-full"
                      asChild
                    >
                      <Link href="/tools">
                        Maybe Later
                      </Link>
                    </Button>
                  </div>

                  <p className="text-center text-sm mt-4">
                    ⚡ {tripwireOffer.urgency} • 60-Day Money-Back Guarantee
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready for Email Campaigns That Convert?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              We've helped clients achieve 45%+ open rates and 12%+ click rates. Let us manage your email marketing.
            </p>
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-purple-600 font-bold px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg"
              asChild
            >
              <Link href="/contact">
                Get Professional Email Marketing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default EmailTesterLanding;
