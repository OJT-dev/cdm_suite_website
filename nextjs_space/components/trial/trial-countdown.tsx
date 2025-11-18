
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, TrendingUp, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface TrialCountdownProps {
  user: any;
}

export function TrialCountdown({ user }: TrialCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!user.trialEndsAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const trialEnd = new Date(user.trialEndsAt).getTime();
      const difference = trialEnd - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          total: difference,
        };
      }
      return null;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [user.trialEndsAt]);

  // Don't show if not on trial
  if (user.subscriptionStatus !== "trialing" || !timeLeft) {
    return null;
  }

  const isUrgent = timeLeft.days < 3;
  const percentComplete = ((7 - timeLeft.days) / 7) * 100;

  return (
    <Card
      className={`p-6 mb-6 border-2 ${
        isUrgent
          ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-200"
          : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isUrgent ? "bg-red-500" : "bg-blue-600"
              }`}
            >
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">
                  {isUrgent ? "⚡ Trial Ending Soon!" : "Your Trial is Active"}
                </h3>
                <Badge variant={isUrgent ? "destructive" : "default"}>
                  {user.tier} Plan
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {isUrgent
                  ? "Upgrade now to keep all your features!"
                  : "Enjoying your trial? Lock in this great rate!"}
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${
                  isUrgent ? "text-red-600" : "text-blue-600"
                }`}
              >
                {timeLeft.days}
              </div>
              <div className="text-xs text-muted-foreground uppercase">Days</div>
            </div>
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${
                  isUrgent ? "text-red-600" : "text-blue-600"
                }`}
              >
                {timeLeft.hours}
              </div>
              <div className="text-xs text-muted-foreground uppercase">Hours</div>
            </div>
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${
                  isUrgent ? "text-red-600" : "text-blue-600"
                }`}
              >
                {timeLeft.minutes}
              </div>
              <div className="text-xs text-muted-foreground uppercase">
                Minutes
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${
                  isUrgent ? "text-red-600" : "text-blue-600"
                }`}
              >
                {timeLeft.seconds}
              </div>
              <div className="text-xs text-muted-foreground uppercase">
                Seconds
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <Progress value={percentComplete} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Day {Math.ceil(7 - timeLeft.days)} of 7-day trial
            </p>
          </div>

          {/* Value Prop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>AI Website Builder</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>Visual Editor</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>SEO Optimization</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>Priority Support</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <Button asChild size="lg" className="whitespace-nowrap">
            <Link href="/dashboard/billing">
              <Zap className="w-4 h-4 mr-2" />
              {isUrgent ? "Upgrade Now" : "Lock in Rate"}
            </Link>
          </Button>
          {isUrgent && (
            <p className="text-xs text-center text-red-600 font-semibold">
              Save 20% if you upgrade today!
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
