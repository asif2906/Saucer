"use client";

import React, { useState, useEffect } from "react";
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
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function SaucerAiStudioPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [targetPlatform, setTargetPlatform] = useState("linkedin");
  const [mode, setMode] = useState<"caption" | "thread" | "hashtags" | "rewrite">("caption");
  const [generating, setGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [tokensUsed, setTokensUsed] = useState<{ input: number; output: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [credits, setCredits] = useState<{ available: number; total: number }>({ available: 50, total: 50 });

  // Fetch real credit balance on mount
  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch("/api/ai/credits");
        if (res.ok) {
          const data = await res.json();
          setCredits({
            available: data.availableCredits,
            total: data.monthlyAllowance + data.purchasedCredits,
          });
        }
      } catch {
        // Safe fallback
      }
    }
    fetchCredits();
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or thought to generate content.");
      return;
    }

    setGenerating(true);
    setGeneratedOutput("");
    setModelUsed(null);
    setTokensUsed(null);

    try {
      let endpoint = "/api/ai/caption";
      let payload: any = {
        topic,
        platform: targetPlatform,
        tone,
        includeEmojis: true,
      };

      if (mode === "thread") {
        endpoint = "/api/ai/thread";
        payload = {
          topic,
          tweetCount: 5,
          hookStyle: "contrarian",
        };
      } else if (mode === "hashtags") {
        endpoint = "/api/ai/hashtags";
        payload = {
          content: topic,
          platform: targetPlatform,
          count: 10,
        };
      } else if (mode === "rewrite") {
        endpoint = "/api/ai/rewrite";
        payload = {
          content: topic,
          tone,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "AI generation failed.");
      }

      // Format output based on feature
      if (mode === "caption") {
        const captionData = json.data;
        const tags = captionData.suggestedHashtags?.map((t: string) => t.startsWith("#") ? t : `#${t}`).join(" ") || "";
        setGeneratedOutput(`${captionData.caption}\n\n${tags}`.trim());
      } else if (mode === "thread") {
        const threadData = json.data;
        const formatted = threadData.thread.map((t: any) => `[${t.index}/${threadData.thread.length}]\n${t.text}`).join("\n\n---\n\n");
        setGeneratedOutput(formatted);
      } else if (mode === "hashtags") {
        const hashData = json.data;
        const tags = hashData.hashtags.join(" ");
        const emojis = hashData.recommendedEmojis?.join(" ") || "";
        setGeneratedOutput(`${tags}\n\nRecommended Emojis: ${emojis}\n\n${hashData.relevanceExplanation || ""}`);
      } else if (mode === "rewrite") {
        setGeneratedOutput(json.data.rewrittenContent);
      }

      setModelUsed(json.meta?.modelUsed || "gemini-3.8-flash");
      setTokensUsed({
        input: json.meta?.inputTokens || 0,
        output: json.meta?.outputTokens || 0,
      });

      if (json.meta?.remainingCredits !== undefined) {
        setCredits((prev) => ({ ...prev, available: json.meta.remainingCredits }));
      }

      toast.success(`Generated with ${json.meta?.modelUsed || "Gemini"}. Settled into ledger.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate content.");
    } finally {
      setGenerating(false);
    }
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
            Synthesize captions, viral threads, and tailored platform variations using Google Gemini Free-Tier.
          </p>
        </div>

        <Badge variant="outline" className="px-3 py-1.5 text-xs gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{credits.available} / {credits.total} Credits Spendable</span>
        </Badge>
      </div>

      {/* Mandatory Unpaid Tier Privacy Notice Banner */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-foreground">Google Gemini Free-Tier Privacy Notice</span>
          <p className="text-muted-foreground leading-relaxed">
            Saucer AI operates exclusively on Google&apos;s unpaid free-tier Gemini API. Content submitted to Google may be processed to improve products. Please do not submit confidential business secrets, passwords, or personal credentials.
          </p>
        </div>
      </div>

      {/* Generation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (6 Cols) */}
        <Card className="lg:col-span-6 p-6 space-y-5">
          {/* Feature Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Generation Mode</label>
            <div className="grid grid-cols-4 gap-1.5 bg-muted/60 p-1 rounded-lg border text-xs">
              {[
                { id: "caption", label: "Caption", cost: "1 credit" },
                { id: "thread", label: "Thread", cost: "3 credits" },
                { id: "hashtags", label: "Hashtags", cost: "1 credit" },
                { id: "rewrite", label: "Rewrite", cost: "1 credit" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id as any)}
                  className={`py-1.5 px-2 rounded-md font-medium text-center transition-colors ${
                    mode === m.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="text-xs">{m.label}</div>
                  <div className="text-[10px] text-muted-foreground opacity-75">{m.cost}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {mode === "rewrite" ? "Original Content to Rewrite" : "Topic or Concept Prompt"}
            </label>
            <Textarea
              placeholder={
                mode === "rewrite"
                  ? "Paste existing post text to adjust tone..."
                  : mode === "thread"
                  ? "Enter the core theme for your multi-tweet breakdown (e.g. 5 SaaS architectural mistakes)..."
                  : mode === "hashtags"
                  ? "Paste your post content to extract trending niche hashtags..."
                  : "e.g. Announcing our new open-source social media management engine..."
              }
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[140px] text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Platform</label>
              <select
                className="w-full text-xs h-9 px-3 rounded-md border bg-background"
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
              >
                <option value="linkedin">LinkedIn (Professional & In-depth)</option>
                <option value="x">X / Twitter (Concise & High-Hook)</option>
                <option value="instagram">Instagram (Visual & Emoji-Rich)</option>
                <option value="facebook">Facebook (Conversational & Community)</option>
                <option value="general">General / Multi-Network</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Tone of Voice</label>
              <select
                className="w-full text-xs h-9 px-3 rounded-md border bg-background"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="professional">Professional & Authoritative</option>
                <option value="casual">Casual & Conversational</option>
                <option value="witty">Witty & Humorous</option>
                <option value="urgent">Urgent & High-Energy</option>
                <option value="educational">Educational & Structured</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full h-10 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing with Gemini Free-Tier...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize Content</span>
              </>
            )}
          </Button>
        </Card>

        {/* Right Output (6 Cols) */}
        <Card className="lg:col-span-6 p-6 space-y-4 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Synthesized Output
                </span>
                {modelUsed && (
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 border-emerald-500/20">
                    {modelUsed}
                  </Badge>
                )}
              </div>

              {generatedOutput && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 text-xs gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
              )}
            </div>

            {generating ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-xs text-muted-foreground animate-pulse">
                  Routing request through Global Quota Controller & Google Gemini...
                </p>
              </div>
            ) : generatedOutput ? (
              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-xs leading-relaxed whitespace-pre-wrap font-sans text-foreground">
                {generatedOutput}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
                <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-xs">
                  Your synthesized content will appear here with live preview formatting.
                </p>
              </div>
            )}
          </div>

          {tokensUsed && (
            <div className="pt-3 border-t flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>Tokens: {tokensUsed.input} in / {tokensUsed.output} out</span>
              <span className="text-emerald-600 dark:text-emerald-400">Zero API cost (Free Tier)</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
