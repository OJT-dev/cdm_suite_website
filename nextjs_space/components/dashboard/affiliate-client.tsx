
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  Mail,
  Share2,
  Gift,
  ExternalLink,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AffiliateData {
  affiliateCode: string | null;
  commissionRate: number;
  referredBy: string | null;
  earnings: number;
  stats: {
    totalReferrals: number;
    convertedReferrals: number;
    pendingReferrals: number;
    totalEarnings: number;
    unpaidEarnings: number;
  };
  referrals: Array<{
    id: string;
    email: string;
    status: string;
    tier: string | null;
    commission: number;
    date: Date;
  }>;
}

export function AffiliateClient({ user }: { user: any }) {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cdmsuite.abacusai.app';

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const response = await fetch("/api/affiliate");
      if (response.ok) {
        const affiliateData = await response.json();
        setData(affiliateData);
      }
    } catch (error) {
      console.error("Failed to fetch affiliate data:", error);
      toast({
        title: "Error",
        description: "Failed to load affiliate data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAffiliateCode = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/affiliate/generate-code", {
        method: "POST",
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success!",
          description: result.isNew 
            ? "Your affiliate code has been generated" 
            : "Your affiliate code is ready",
        });
        await fetchAffiliateData();
      } else {
        throw new Error("Failed to generate code");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate affiliate code",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Check out CDM Suite - Complete Digital Marketing Platform");
    const body = encodeURIComponent(
      `Hi!\n\nI've been using CDM Suite for my digital marketing needs and thought you might find it useful too.\n\nCDM Suite offers:\n• AI-powered website builder\n• Professional marketing services\n• SEO optimization\n• Social media management\n• And much more!\n\nUse my referral link to get started:\n${baseUrl}/auth/signup?ref=${data?.affiliateCode}\n\nBest regards,\n${user.name || 'Your friend'}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareOnSocial = (platform: string) => {
    const url = `${baseUrl}/auth/signup?ref=${data?.affiliateCode}`;
    const text = "Check out CDM Suite - Complete Digital Marketing Platform! 🚀";
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "converted":
      case "paid":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      converted: "default",
      paid: "default",
      pending: "secondary",
    };
    
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // No affiliate code yet
  if (!data?.affiliateCode) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Program</h1>
          <p className="text-gray-600 mt-1">
            Earn 20% commission on every referral
          </p>
        </div>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Join Our Affiliate Program</CardTitle>
            <CardDescription className="text-base mt-2">
              Earn 20% recurring commission for every customer you refer to CDM Suite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Share Your Link</h4>
                <p className="text-sm text-muted-foreground">
                  Get a unique referral link to share
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">They Subscribe</h4>
                <p className="text-sm text-muted-foreground">
                  Your referrals sign up and subscribe
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Earn Commission</h4>
                <p className="text-sm text-muted-foreground">
                  Get 20% of their subscription fee
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg space-y-3">
              <h4 className="font-semibold">Program Benefits:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">20% recurring commission on all paid plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Commission on upgrades and renewals</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Real-time tracking dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Marketing materials provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">No limit on earnings</span>
                </li>
              </ul>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={generateAffiliateCode}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Get My Affiliate Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const referralUrl = `${baseUrl}/auth/signup?ref=${data.affiliateCode}`;
  const commissionPercentage = (data.commissionRate * 100).toFixed(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Affiliate Program</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Earn {commissionPercentage}% commission on every referral
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{data.stats.totalReferrals}</div>
              <Users className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Converted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">
                {data.stats.convertedReferrals}
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-purple-600">
                ${data.stats.totalEarnings.toFixed(2)}
              </div>
              <DollarSign className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Payout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-orange-600">
                ${data.stats.unpaidEarnings.toFixed(2)}
              </div>
              <Clock className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link to earn {commissionPercentage}% commission on every subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Affiliate Code */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Affiliate Code
            </label>
            <div className="flex gap-2">
              <Input
                value={data.affiliateCode}
                readOnly
                className="font-mono font-bold text-lg"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(data.affiliateCode!, "Code")}
              >
                {copied === "Code" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Referral URL */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Referral URL
            </label>
            <div className="flex gap-2">
              <Input value={referralUrl} readOnly className="font-mono" />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(referralUrl, "Link")}
              >
                {copied === "Link" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Share Buttons */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Share Your Link
            </label>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={shareViaEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" onClick={() => shareOnSocial('twitter')}>
                <Share2 className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" onClick={() => shareOnSocial('linkedin')}>
                <Share2 className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              <Button variant="outline" onClick={() => shareOnSocial('facebook')}>
                <Share2 className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>
            Track your referrals and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.referrals.length > 0 ? (
            <div className="space-y-3">
              {data.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(referral.status)}
                    <div>
                      <p className="font-medium">{referral.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(referral.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {referral.tier && (
                      <Badge variant="outline" className="capitalize">
                        {referral.tier}
                      </Badge>
                    )}
                    {getStatusBadge(referral.status)}
                    {referral.commission > 0 && (
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-green-600">
                          ${referral.commission.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No referrals yet. Start sharing your link to earn commissions!
              </p>
              <Button onClick={() => copyToClipboard(referralUrl, "Link")}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Referral Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Info */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold">Share Your Link</h4>
              <p className="text-sm text-muted-foreground">
                Share your unique referral link via email, social media, or your website
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold">They Subscribe</h4>
              <p className="text-sm text-muted-foreground">
                When someone signs up using your link and subscribes to a paid plan
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold">Earn Commission</h4>
              <p className="text-sm text-muted-foreground">
                You earn {commissionPercentage}% of their subscription fee, including renewals and upgrades
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
