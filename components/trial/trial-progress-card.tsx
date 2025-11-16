
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, CheckCircle, Circle, Lock } from "lucide-react";
import Link from "next/link";

interface Milestone {
  title: string;
  description: string;
  completed: boolean;
  locked?: boolean;
}

interface TrialProgressCardProps {
  milestones: Milestone[];
  trialDaysLeft: number;
}

export function TrialProgressCard({
  milestones,
  trialDaysLeft,
}: TrialProgressCardProps) {
  const completedCount = milestones.filter((m) => m.completed).length;
  const progress = (completedCount / milestones.length) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Your Trial Journey</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {milestones.length} milestones completed
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {trialDaysLeft}
          </div>
          <div className="text-xs text-muted-foreground">days left</div>
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-6" />

      <div className="space-y-3 mb-6">
        {milestones.map((milestone, index) => (
          <div key={index} className="flex items-start gap-3">
            {milestone.completed ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : milestone.locked ? (
              <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-medium text-sm ${
                  milestone.completed
                    ? "text-gray-900"
                    : milestone.locked
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                {milestone.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {milestone.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {progress < 100 && (
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm font-medium mb-2">
            Complete your journey and get 15% off any plan!
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/billing">View Plans</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
