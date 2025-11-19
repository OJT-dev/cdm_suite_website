
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Rocket, Zap, TrendingUp, Globe } from "lucide-react";

const GOALS = [
  { id: "seo", label: "Improve SEO & Search Rankings", icon: TrendingUp },
  { id: "traffic", label: "Increase Website Traffic", icon: Globe },
  { id: "leads", label: "Generate More Leads", icon: Zap },
  { id: "conversions", label: "Boost Conversions & Sales", icon: Rocket },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    industry: "",
    goals: [] as string[],
  });

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/update-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-2xl mx-auto mb-4">
            {step}/2
          </div>
          <CardTitle className="text-2xl">Welcome to CDM Suite! 🚀</CardTitle>
          <CardDescription>
            Let's personalize your experience in just 2 quick steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="industry">What industry are you in?</Label>
                <Input
                  id="industry"
                  placeholder="e.g., E-commerce, SaaS, Consulting, etc."
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.industry}
                >
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label>What are your primary goals?</Label>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Select all that apply
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GOALS.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <div
                        key={goal.id}
                        className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          const newGoals = formData.goals.includes(goal.id)
                            ? formData.goals.filter((g) => g !== goal.id)
                            : [...formData.goals, goal.id];
                          setFormData({ ...formData, goals: newGoals });
                        }}
                      >
                        <Checkbox
                          checked={formData.goals.includes(goal.id)}
                          onCheckedChange={() => {}}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{goal.label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={formData.goals.length === 0 || loading}
                >
                  {loading ? "Completing..." : "Complete Setup →"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
