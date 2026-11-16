"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Sliders,
  Send,
  Loader2,
  Layers,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

export default function SaucerAiStudioPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [targetPlatform, setTargetPlatform] = useState("linkedin");
  const [generating, setGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or thought to generate content.");
      return;
    }

    setGenerating(true);
    // Simulating free-tier Google Gemini 3.8 Flash generation
    setTimeout(() => {
      setGenerating(false);
      let output = "";

      if (targetPlatform === "linkedin") {
        output = `Building a durable SaaS platform requires making hard architectural choices early.\n\nHere are 3 principles we prioritized at Saucer:\n\n1. Zero-Trust multi-tenancy at the repository layer.\n2. Server-side credit reservation to eliminate race conditions.\n3. Decoupling fast frontend interactions from durable background publishing workers.\n\nWhat architectural decisions have paid off the most for your team?\n\n#SaaSArchitecture #EngineeringLeadership #BuildInPublic`;
      } else if (targetPlatform === "x") {
        output = `Most creators spend 80% of their time reformatting posts across platforms.\n\nSaucer centralizes everything into one orbit with automated adaptation.\n\nWork smarter, not louder. 🚀 #CreatorTools`;
      } else {
        output = `Behind every smooth product launch is a team that refused to take shortcuts on infrastructure.\n\nSaucer is built for creators, startups, and agencies who take their social presence seriously.\n\n#SocialMediaStrategy #SaaSGrowth #TechStartup`;
      }

      setGeneratedOutput(output);
      toast.success("Content synthesized with Saucer AI (Gemini 3.8 Flash). 1 credit deducted.");
    }, 1200);
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-500" />
            <span>Saucer AI Content Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Synthesize captions, viral threads, and tailored platform variations using Google Gemini.
          </p>
        </div>

        <Badge variant="purple" className="px-3 py-1 text-xs gap-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span>48 / 50 Monthly Credits Available</span>
        </Badge>
      </div>

      {/* Mandatory Unpaid Tier Privacy Notice Banner */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-foreground">Saucer AI Privacy & Free-Tier Notice</span>
          <p className="text-muted-foreground leading-relaxed">
            Saucer AI operates exclusively on Google's free-tier Gemini API. To provide this feature without cost, prompts and generated outputs may be processed by Google to improve machine learning models. Please do not submit confidential business secrets, passwords, or sensitive personal information.
          </p>
        </div>
      </div>

      {/* Generation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (7 Cols) */}
        <Card className="lg:col-span-6 p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              What would you like to create?
            </label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 3 lessons learned building our SaaS startup, or announcement of our new visual calendar feature..."
              className="min-h-[120px] text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Platform</label>
              <select
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs"
              >
                <option value="linkedin">LinkedIn (Professional)</option>
                <option value="x">X / Twitter (Concise Thread)</option>
                <option value="instagram">Instagram (Visual Caption)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs"
              >
                <option value="professional">Professional & Authoritative</option>
                <option value="casual">Casual & Authentic</option>
                <option value="bold">Bold & Contrarian</option>
                <option value="concise">Concise & Punchy</option>
              </select>
            </div>
          </div>

          <Button
            variant="gradient"
            onClick={handleGenerate}
            disabled={generating}
            className="w-full h-10 text-xs font-semibold"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing with Gemini 3.8 Flash...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Generate Content (1 Credit)</span>
              </span>
            )}
          </Button>
        </Card>

        {/* Right Output (6 Cols) */}
        <Card className="lg:col-span-6 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <span className="text-xs font-bold text-foreground">Synthesized Output</span>
            {generatedOutput && (
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs gap-1">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Text"}</span>
              </Button>
            )}
          </div>

          {generatedOutput ? (
            <div className="p-4 rounded-xl bg-muted/40 border text-xs leading-relaxed whitespace-pre-wrap font-sans text-foreground">
              {generatedOutput}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground text-xs rounded-xl border border-dashed">
              <Sparkles className="w-8 h-8 text-violet-500/40 mx-auto mb-2" />
              <p>Enter your topic prompt on the left to generate platform-optimized content.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

