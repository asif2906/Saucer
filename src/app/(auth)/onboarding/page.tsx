"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PlatformIcon } from "@/components/platform-icon";
import { toast } from "sonner";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("My Primary Orbit");
  const [timezone, setTimezone] = useState("UTC");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["x", "linkedin"]);

  const platforms = [
    { id: "x", name: "X (Twitter)" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "instagram", name: "Instagram" },
    { id: "facebook", name: "Facebook" },
    { id: "youtube", name: "YouTube" },
    { id: "threads", name: "Threads" },
  ];

  const togglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handleFinish = () => {
    toast.success("Workspace ready! Welcome to Saucer.");
    router.push("/app");
  };

  return (
    <Card className="border-border shadow-2xl backdrop-blur-sm bg-card/90 max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center mx-auto mb-2">
          <Sparkles className="w-5 h-5" />
        </div>
        <CardTitle className="text-2xl font-bold">Configure Your Orbit</CardTitle>
        <CardDescription>
          Step {step} of 2 — Personalize your initial Saucer workspace
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Default Workspace Name
              </label>
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Studio, Tech Brand"
              />
              <p className="text-[11px] text-muted-foreground">
                You can create separate workspaces for multiple clients or brands later.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Publishing Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New York (Eastern Time)</option>
                <option value="America/Los_Angeles">America/Los Angeles (Pacific Time)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-1">
                Which networks will you publish to first?
              </h4>
              <p className="text-[11px] text-muted-foreground mb-3">
                Select your primary channels. You will authenticate OAuth connections in the dashboard.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {platforms.map((plat) => {
                const isSelected = selectedPlatforms.includes(plat.id);
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => togglePlatform(plat.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "border-violet-600 bg-violet-600/10 text-foreground"
                        : "border-border hover:border-muted-foreground/30 bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={plat.id} size={18} />
                      <span className="text-xs font-medium">{plat.name}</span>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-3 pt-2">
        {step === 1 ? (
          <Button
            type="button"
            variant="gradient"
            className="w-full"
            onClick={() => setStep(2)}
          >
            <span>Continue to Channels</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <div className="flex w-full gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="w-1/3"
            >
              Back
            </Button>
            <Button
              type="button"
              variant="gradient"
              onClick={handleFinish}
              className="w-2/3"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

