"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointerClick, 
  Download, 
  Calendar,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Plus,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/platform-icon";
import { useUser } from "@/contexts/user-context";

const DATE_RANGES = [
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "Last 90 Days" },
];

export default function AnalyticsPage() {
  const { currentWorkspace } = useUser();
  const [selectedRange, setSelectedRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [accRes, postRes] = await Promise.all([
          fetch("/api/social/accounts"),
          fetch("/api/publishing/posts?view=queue"),
        ]);

        if (accRes.ok) {
          const accData = await accRes.json();
          setAccounts(accData.accounts || []);
        }

        if (postRes.ok) {
          const postData = await postRes.json();
          setPosts(postData.posts || []);
        }
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentWorkspace?.id]);

  const publishedPosts = posts.filter((p) => p.status === "PUBLISHED");
  const scheduledPosts = posts.filter((p) => p.status === "SCHEDULED");
  const draftPosts = posts.filter((p) => p.status === "DRAFT");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated cross-platform metrics, publishing volume, and channel insights.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
      </div>

      {/* Production Metrics Status */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 text-xs">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-violet-500" />
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">Verified Production Metrics: </span>
          Analytics track actual broadcast activities and channel volume in real time. Social network reach and impression counters synchronize upon live publication to connected providers.
        </div>
      </div>

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Published Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Published Posts</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : publishedPosts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total completed broadcasts</p>
          </CardContent>
        </Card>

        {/* Scheduled In Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Scheduled in Queue</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : scheduledPosts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending automatic publishing</p>
          </CardContent>
        </Card>

        {/* Connected Channels */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active Channels</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Share2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : accounts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Connected social accounts</p>
          </CardContent>
        </Card>

        {/* Drafts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Work in Progress</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : draftPosts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Unpublished drafts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Content Performance */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Published Content History</CardTitle>
              <CardDescription className="text-xs">
                Real posts published from this workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  <span>Loading performance data...</span>
                </div>
              ) : publishedPosts.length === 0 ? (
                <div className="py-12 text-center space-y-3 border border-dashed rounded-xl">
                  <BarChart3 className="w-8 h-8 mx-auto text-muted-foreground/50" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">No published posts yet</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Once you schedule or publish posts through Saucer, their delivery confirmations and engagement insights will appear here.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href="/app/create">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>Create and Publish a Post</span>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {publishedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3.5 rounded-xl border bg-card/60 hover:bg-accent/40 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1 truncate flex-1 mr-4">
                        <p className="text-foreground font-medium truncate">{post.content}</p>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="success" className="text-[10px] shrink-0">
                        Published
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Channel Distribution */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Channel Coverage</CardTitle>
              <CardDescription className="text-xs">Connected network breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Loading channel data...
                </div>
              ) : accounts.length === 0 ? (
                <div className="py-8 text-center space-y-2 border border-dashed rounded-lg">
                  <p className="text-xs text-muted-foreground">No social channels connected.</p>
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href="/app/social-accounts">Connect Channel</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={acc.provider?.toLowerCase()} size={16} />
                        <div>
                          <div className="font-semibold text-foreground">{acc.accountName}</div>
                          <div className="text-[10px] text-muted-foreground">{acc.accountHandle || acc.provider}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {acc.connectionStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
