
"use client";

import { Card } from "@/components/ui/card";
import { Sparkles, Layout, Palette, FileText, Check } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  { icon: Layout, label: "Analyzing template", duration: 2000 },
  { icon: Palette, label: "Creating design system", duration: 3000 },
  { icon: FileText, label: "Generating content", duration: 4000 },
  { icon: Check, label: "Building your website", duration: 2000 },
];

export function BuilderProgress() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = STEPS.reduce((sum, step) => sum + step.duration, 0);
    const interval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 99);
      setProgress(newProgress);

      // Update current step
      let stepElapsed = 0;
      for (let i = 0; i < STEPS.length; i++) {
        stepElapsed += STEPS[i].duration;
        if (elapsed < stepElapsed) {
          setCurrentStep(i);
          break;
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Sparkles className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Creating Your Website...</h2>
        <p className="text-muted-foreground">
          Our AI is working its magic. This will take just a moment.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {Math.round(progress)}% complete
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                isCurrent
                  ? "bg-blue-50 border-2 border-blue-200"
                  : isCompleted
                  ? "bg-green-50 border border-green-200"
                  : "bg-muted/50 border border-transparent"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? "bg-green-500"
                    : isCurrent
                    ? "bg-blue-500 animate-pulse"
                    : "bg-gray-300"
                }`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    isCurrent
                      ? "text-blue-900"
                      : isCompleted
                      ? "text-green-900"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {isCompleted && (
                <Check className="w-5 h-5 text-green-600" />
              )}
              {isCurrent && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
