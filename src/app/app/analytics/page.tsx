"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointerClick, 
  Share2, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Info,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/platform-icon";

const DATE_RANGES = [
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "Last 90 Days" },
  { id: "ytd", label: "Year to Date" },
];

const PLATFORMS = [
  { id: "all", label: "All Networks" },
  { id: "twitter", label: "X (Twitter)" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "youtube", label: "YouTube" },
];

const METRICS_DATA: Record<string, {
  impressions: string;
  impressionsDelta: string;
  impressionsUp: boolean;
  reach: string;
  reachDelta: string;
  reachUp: boolean;
  engagement: string;
  engagementDelta: string;
  engagementUp: boolean;
  clicks: string;
  clicksDelta: string;
  clicksUp: boolean;
}> = {
  "7d": {
    impressions: "124,580",
    impressionsDelta: "+14.2%",
    impressionsUp: true,
    reach: "89,420",
    reachDelta: "+11.8%",
    reachUp: true,
    engagement: "4.82%",
    engagementDelta: "+0.6%",
    engagementUp: true,
    clicks: "3,892",
    clicksDelta: "-2.1%",
    clicksUp: false,
  },
  "30d": {
    impressions: "482,910",
    impressionsDelta: "+24.5%",
    impressionsUp: true,
    reach: "341,200",
    reachDelta: "+19.1%",
    reachUp: true,
    engagement: "5.14%",
    engagementDelta: "+1.2%",
    engagementUp: true,
    clicks: "16,420",
    clicksDelta: "+8.4%",
    clicksUp: true,
  },
  "90d": {
    impressions: "1,290,400",
    impressionsDelta: "+38.0%",
    impressionsUp: true,
    reach: "912,050",
    reachDelta: "+32.4%",
    reachUp: true,
    engagement: "4.95%",
    engagementDelta: "+0.9%",
    engagementUp: true,
    clicks: "47,810",
    clicksDelta: "+15.3%",
    clicksUp: true,
  },
  "ytd": {
    impressions: "3,410,200",
    impressionsDelta: "+52.6%",
    impressionsUp: true,
    reach: "2,480,900",
    reachDelta: "+44.1%",
    reachUp: true,
    engagement: "5.02%",
    engagementDelta: "+1.4%",
    engagementUp: true,
    clicks: "118,400",
    clicksDelta: "+28.2%",
    clicksUp: true,
  },
};

const PLATFORM_BREAKDOWN = [
  { platform: "twitter", name: "X (Twitter)", shares: "42%", impressions: "202,822", engagement: "4.1%", color: "bg-neutral-800 dark:bg-neutral-200" },
  { platform: "linkedin", name: "LinkedIn", shares: "28%", impressions: "135,214", engagement: "6.8%", color: "bg-blue-600" },
  { platform: "instagram", name: "Instagram", shares: "18%", impressions: "86,923", engagement: "5.9%", color: "bg-pink-600" },
  { platform: "facebook", name: "Facebook", shares: "8%", impressions: "38,632", engagement: "3.2%", color: "bg-blue-800" },
  { platform: "youtube", name: "YouTube", shares: "4%", impressions: "19,319", engagement: "8.4%", color: "bg-red-600" },
];

const TOP_POSTS = [
  {
    id: "p1",
    platform: "linkedin",
    content: "Excited to introduce Saucer: The next-generation open-source social media management engine powered by Google Gemini free tier. Zero API cost, full multi-network power...",
    date: "Nov 14, 2026",
    impressions: "48,290",
    engagement: "7.9%",
    clicks: "1,842",
    reposts: "142",
  },
  {
    id: "p2",
    platform: "twitter",
    content: "Why pay \$299/mo for social suites when you can host your own Saucer instance? Full X, LinkedIn, Instagram scheduling with AI caption ideation completely free.",
    date: "Nov 12, 2026",
    impressions: "82,100",
    engagement: "5.4%",
    clicks: "2,190",
    reposts: "318",
  },
  {
    id: "p3",
    platform: "instagram",
    content: "Behind the scenes: How we designed Saucer's unified content composer. Multi-network character limits and live reactive preview widgets in action.",
    date: "Nov 10, 2026",
    impressions: "31,450",
    engagement: "6.8%",
    clicks: "612",
    reposts: "89",
  },
];

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("30d");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const currentMetrics = METRICS_DATA[selectedRange] || METRICS_DATA["30d"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated cross-platform engagement, impressions, audience reach, and content insights.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border text-xs">
            {DATE_RANGES.map((range) => (
              <button
                key={range.id}
                onClick={() => setSelectedRange(range.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedRange === range.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Development / Sample Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 text-sky-800 dark:text-sky-300 text-xs">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
        <div>
          <span className="font-semibold">Simulated Development Environment: </span>
          Displaying sample workspace metrics for interface verification. In live operation, metrics are fetched asynchronously via official social Graph & Insights endpoints (Meta Graph API, X v2 API, LinkedIn Community Insights).
        </div>
      </div>

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Impressions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Impressions</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Eye className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.impressions}</div>
            <div className="flex items-center gap-1 text-xs mt-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>{currentMetrics.impressionsDelta}</span>
              <span className="text-muted-foreground font-normal ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* Reach */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Audience Reach</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.reach}</div>
            <div className="flex items-center gap-1 text-xs mt-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>{currentMetrics.reachDelta}</span>
              <span className="text-muted-foreground font-normal ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Engagement Rate</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.engagement}</div>
            <div className="flex items-center gap-1 text-xs mt-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>{currentMetrics.engagementDelta}</span>
              <span className="text-muted-foreground font-normal ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* Link Clicks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Outbound Clicks</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <MousePointerClick className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.clicks}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 font-medium ${
              currentMetrics.clicksUp ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            }`}>
              {currentMetrics.clicksUp ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              <span>{currentMetrics.clicksDelta}</span>
              <span className="text-muted-foreground font-normal ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Distribution & Trend Chart Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Trend Visualizer */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Weekly Impressions Trend</CardTitle>
              <CardDescription className="text-xs">Daily impressions across all connected channels</CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
              Live Data
            </div>
          </CardHeader>
          <CardContent>
            {/* CSS-rendered Bar Chart visualization */}
            <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b">
              {[
                { day: "Mon", height: "45%", val: "14.2k" },
                { day: "Tue", height: "62%", val: "19.5k" },
                { day: "Wed", height: "88%", val: "27.8k" },
                { day: "Thu", height: "74%", val: "23.4k" },
                { day: "Fri", height: "95%", val: "30.1k" },
                { day: "Sat", height: "55%", val: "17.3k" },
                { day: "Sun", height: "40%", val: "12.6k" },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {bar.val}
                  </span>
                  <div className="w-full max-w-[42px] bg-muted group-hover:bg-muted/80 rounded-t-md h-40 flex items-end overflow-hidden">
                    <div 
                      className="w-full bg-emerald-500/80 group-hover:bg-emerald-500 transition-all rounded-t-sm"
                      style={{ height: bar.height }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{bar.day}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3">
              <span>Peak Day: <strong className="text-foreground">Friday (30,100 impressions)</strong></span>
              <span>Average Daily: <strong className="text-foreground">20,700 impressions</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Platform Share Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Share by Platform</CardTitle>
            <CardDescription className="text-xs">Distribution of audience engagement by network</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PLATFORM_BREAKDOWN.map((p) => (
              <div key={p.platform} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium">
                    <PlatformIcon platform={p.platform} size={14} />
                    <span>{p.name}</span>
                  </div>
                  <span className="text-muted-foreground font-mono">{p.shares}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${p.color}`} 
                    style={{ width: p.shares }} 
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{p.impressions} imps</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{p.engagement} eng</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">Top Performing Content</CardTitle>
            <CardDescription className="text-xs">Posts ranked by highest audience engagement in the selected period</CardDescription>
          </div>

          {/* Network Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PLATFORMS.map((pf) => (
              <button
                key={pf.id}
                onClick={() => setSelectedPlatform(pf.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  selectedPlatform === pf.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {pf.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-3 font-medium">Network</th>
                  <th className="pb-3 font-medium min-w-[280px]">Post Content</th>
                  <th className="pb-3 font-medium text-right">Published</th>
                  <th className="pb-3 font-medium text-right">Impressions</th>
                  <th className="pb-3 font-medium text-right">Engagement</th>
                  <th className="pb-3 font-medium text-right">Clicks</th>
                  <th className="pb-3 font-medium text-right">Shares</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {TOP_POSTS
                  .filter((p) => selectedPlatform === "all" || p.platform === selectedPlatform)
                  .map((post) => (
                    <tr key={post.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <PlatformIcon platform={post.platform} size={16} />
                          <span className="capitalize text-muted-foreground">{post.platform}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-normal text-foreground">
                        <p className="line-clamp-2">{post.content}</p>
                      </td>
                      <td className="py-3 text-right text-muted-foreground whitespace-nowrap">
                        {post.date}
                      </td>
                      <td className="py-3 text-right font-medium font-mono">
                        {post.impressions}
                      </td>
                      <td className="py-3 text-right font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                        {post.engagement}
                      </td>
                      <td className="py-3 text-right font-mono text-muted-foreground">
                        {post.clicks}
                      </td>
                      <td className="py-3 text-right font-mono text-muted-foreground">
                        {post.reposts}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

