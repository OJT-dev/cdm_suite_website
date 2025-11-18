

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

interface CreditsCardProps {
  credits: number;
  tier: string;
}

export function CreditsCard({ credits, tier }: CreditsCardProps) {
  const tierLimits: Record<string, number> = {
    free: 1,
    starter: 5,
    growth: 20,
    pro: 50,
    enterprise: 999,
  };

  const maxCredits = tierLimits[tier] || 1;
  const percentageUsed = Math.min((credits / maxCredits) * 100, 100);
  const needsUpgrade = credits === 0;

  return (
    <Card className={needsUpgrade ? "border-orange-300 bg-orange-50" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-gray-600">
            Project Credits
          </CardTitle>
          <CardDescription className="text-xs">
            Use credits to create websites
          </CardDescription>
        </div>
        <Coins className={`w-5 h-5 ${needsUpgrade ? "text-orange-500" : "text-blue-500"}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold">{credits}</span>
          <span className="text-sm text-gray-500">/ {maxCredits}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className={`h-2 rounded-full transition-all ${
              percentageUsed < 20 ? "bg-orange-500" : 
              percentageUsed < 50 ? "bg-yellow-500" : 
              "bg-blue-500"
            }`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        {needsUpgrade ? (
          <Button asChild size="sm" className="w-full" variant="outline">
            <Link href="/dashboard/billing">
              <Plus className="mr-2 h-4 w-4" />
              Get More Credits
            </Link>
          </Button>
        ) : (
          <p className="text-xs text-gray-500">
            Each website creation uses 1 credit
          </p>
        )}
      </CardContent>
    </Card>
  );
}
