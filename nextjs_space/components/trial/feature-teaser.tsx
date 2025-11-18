
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

interface FeatureTeaserProps {
  title: string;
  description: string;
  requiredTier: "starter" | "growth" | "pro" | "enterprise";
  currentTier: string;
  icon?: React.ReactNode;
  features?: string[];
}

export function FeatureTeaser({
  title,
  description,
  requiredTier,
  currentTier,
  icon,
  features = [],
}: FeatureTeaserProps) {
  const tierOrder = ["free", "starter", "growth", "pro", "enterprise"];
  const isLocked =
    tierOrder.indexOf(currentTier) < tierOrder.indexOf(requiredTier);

  if (!isLocked) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
          {icon || <Sparkles className="w-6 h-6 text-white" />}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{description}</p>
            </div>
            <Badge variant="secondary" className="ml-2">
              <Lock className="w-3 h-3 mr-1" />
              {requiredTier} Plan
            </Badge>
          </div>

          {features.length > 0 && (
            <ul className="space-y-1 mb-4">
              {features.map((feature, index) => (
                <li key={index} className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <Button asChild size="sm">
            <Link href="/dashboard/billing">
              <TrendingUp className="w-4 h-4 mr-2" />
              Upgrade to Unlock
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
