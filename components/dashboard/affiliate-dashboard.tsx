

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  DollarSign,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  TrendingUp,
  Clock,
  Share2,
  Mail,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface AffiliateData {
  affiliateCode: string | null;
  commissionRate: number;
  earnings: number;
  stats: {
    totalReferrals: number;
    convertedReferrals: number;
    pendingReferrals: number;
    unpaidEarnings: number;
  };
  referrals: Array<{
    id: string;
    email: string;
    status: string;
    tier: string | null;
    commission: number;
    date: string;
  }>;
}

export function AffiliateDashboard() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  async function fetchAffiliateData() {
    try {
      const response = await fetch("/api/affiliate");
      if (response.ok) {
        const data = await response.json();
        setData(data);
      }
    } catch (error) {
      console.error("Failed to fetch affiliate data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function generateAffiliateCode() {
    setGenerating(true);
    try {
      const response = await fetch("/api/affiliate/generate-code", {
        method: "POST",
      });
      if (response.ok) {
        const result = await response.json();
        toast.success(
          result.isNew
            ? "Affiliate code generated!"
            : "Your affiliate code is ready"
        );
        await fetchAffiliateData();
      } else {
        toast.error("Failed to generate affiliate code");
      }
    } catch (error) {
      toast.error("Failed to generate affiliate code");
    } finally {
      setGenerating(false);
    }
  }

  function copyAffiliateLink() {
    if (!data?.affiliateCode) return;
    
    const affiliateLink = `${window.location.origin}/auth/signup?ref=${data.affiliateCode}`;
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    toast.success("Affiliate link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function shareViaEmail() {
    if (!data?.affiliateCode) return;
    
    const affiliateLink = `${window.location.origin}/auth/signup?ref=${data.affiliateCode}`;
    const subject = "Build Your Website with CDM Suite";
    const body = `I've been using CDM Suite to build professional websites with AI, and I think you'd love it!\n\nSign up using my link and get started: ${affiliateLink}\n\nYou'll get access to powerful marketing tools and AI-powered website builder.`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.affiliateCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Join Our Affiliate Program
          </CardTitle>
          <CardDescription>
            Earn {data?.commissionRate ? `${(data.commissionRate * 100).toFixed(0)}%` : "20%"} commission on every referral
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Share CDM Suite with your network and earn money for every paid subscription.
              Get your unique referral link to start earning!
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">20%</div>
                <div className="text-sm text-gray-600">Commission Rate</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">$49-249</div>
                <div className="text-sm text-gray-600">Per Referral</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">∞</div>
                <div className="text-sm text-gray-600">Unlimited Earnings</div>
              </div>
            </div>

            <Button
              onClick={generateAffiliateCode}
              disabled={generating}
              className="w-full"
              size="lg"
            >
              {generating ? "Generating..." : "Get My Affiliate Link"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Earnings
            </CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.earnings.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Referrals
            </CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalReferrals}</div>
            <p className="text-xs text-gray-500 mt-1">People referred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Converted
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.convertedReferrals}</div>
            <p className="text-xs text-gray-500 mt-1">Paid customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <Clock className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.stats.unpaidEarnings.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Unpaid earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Affiliate Link</CardTitle>
          <CardDescription>
            Share this link to earn {(data.commissionRate * 100).toFixed(0)}% commission on referrals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-gray-50 rounded-lg border font-mono text-sm overflow-x-auto">
              {window.location.origin}/auth/signup?ref={data.affiliateCode}
            </div>
            <Button
              onClick={copyAffiliateLink}
              variant="outline"
              className="flex-shrink-0"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={shareViaEmail} variant="outline" className="flex-1">
              <Mail className="mr-2 h-4 w-4" />
              Share via Email
            </Button>
            <Button
              onClick={() => {
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Build professional websites with AI! Sign up for CDM Suite using my link: ${window.location.origin}/auth/signup?ref=${data.affiliateCode}`
                )}`;
                window.open(url, "_blank");
              }}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share on X
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>
            Track your referrals and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No referrals yet. Start sharing your affiliate link!
            </div>
          ) : (
            <div className="space-y-4">
              {data.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{referral.email}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(referral.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {referral.tier && (
                      <Badge variant="outline" className="capitalize">
                        {referral.tier}
                      </Badge>
                    )}
                    <Badge
                      variant={
                        referral.status === "converted" || referral.status === "paid"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {referral.status}
                    </Badge>
                    <div className="font-bold text-green-600 min-w-[80px] text-right">
                      ${referral.commission.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
