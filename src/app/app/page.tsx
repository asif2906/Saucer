"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/platform-icon";
import {
  Calendar,
  PenSquare,
  Clock,
  Sparkles,
  TrendingUp,
  Share2,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Loader2,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";

export default function DashboardOverviewPage() {
  const { user, organization, currentWorkspace, credits } = useUser();
  const [loading, setLoading] = useState(true);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [upcomingPosts, setUpcomingPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    scheduledCount: 0,
    publishedCount: 0,
    draftCount: 0,
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch connected accounts
        const accRes = await fetch("/api/social/accounts");
        if (accRes.ok) {
          const accData = await accRes.json();
          if (accData.success) {
            setConnectedAccounts(accData.accounts || []);
          }
        }

        // 2. Fetch posts
        const postsRes = await fetch("/api/publishing/posts?view=queue");
        if (postsRes.ok) {
          const pData = await postsRes.json();
          if (pData.success) {
            const posts = pData.posts || [];
            setUpcomingPosts(posts.slice(0, 5));

            // Compute counts
            const scheduled = posts.filter((p: any) => p.status === "SCHEDULED").length;
            const published = posts.filter((p: any) => p.status === "PUBLISHED").length;
            const drafts = posts.filter((p: any) => p.status === "DRAFT").length;

            setStats({
              scheduledCount: scheduled,
              publishedCount: published,
              draftCount: drafts,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [currentWorkspace?.id]);

  const remainingCredits = credits?.balance ?? 50;
  const totalAllowance = credits?.monthlyAllowance ?? 50;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {organization?.name || currentWorkspace?.name || "Workspace"} Command Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Welcome back, {user?.fullName || "User"}. Overview of your publishing queue and connected channels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" asChild size="sm">
            <Link href="/app/calendar">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span>Calendar</span>
            </Link>
          </Button>
          <Button variant="gradient" asChild size="sm">
            <Link href="/app/create">
              <PenSquare className="w-3.5 h-3.5 mr-1" />
              <span>Create Post</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-violet-500/30 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Scheduled Posts</span>
              <Clock className="w-4 h-4 text-violet-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground mt-1">
              {stats.scheduledCount}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            {stats.scheduledCount > 0 ? "Queued for broadcast" : "No posts scheduled"}
          </CardContent>
        </Card>

        <Card className="hover:border-violet-500/30 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Published (This Month)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground mt-1">
              {stats.publishedCount}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            Live broadcasts
          </CardContent>
        </Card>

        <Card className="hover:border-violet-500/30 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Drafts</span>
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground mt-1">
              {stats.draftCount}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            In progress
          </CardContent>
        </Card>

        <Card className="hover:border-violet-500/30 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>AI Credits</span>
              <Sparkles className="w-4 h-4 text-violet-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground mt-1">
              {remainingCredits} / {totalAllowance}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            Free tier quota
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Upcoming Schedule & Connected Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Posts */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Upcoming Scheduled Posts</CardTitle>
                <CardDescription className="text-xs">Next broadcasts in your publishing queue</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/app/queue">
                  <span>View Queue</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {loading ? (
                <div className="py-8 flex items-center justify-center text-muted-foreground gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  <span>Loading schedule...</span>
                </div>
              ) : upcomingPosts.length === 0 ? (
                <div className="py-8 text-center space-y-2 border border-dashed rounded-xl">
                  <p className="text-xs text-muted-foreground">No upcoming posts scheduled.</p>
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href="/app/create">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>Compose First Post</span>
                    </Link>
                  </Button>
                </div>
              ) : (
                upcomingPosts.map((post) => {
                  const platforms = post.variants?.map((v: any) => v.platform) || ["instagram"];
                  const scheduledTime = post.scheduledFor
                    ? new Date(post.scheduledFor).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "Scheduled";

                  return (
                    <div
                      key={post.id}
                      className="p-3.5 rounded-xl border bg-card/60 hover:bg-accent/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {platforms.map((plat: string) => (
                              <div key={plat} className="p-1 rounded-full bg-background border shadow-xs">
                                <PlatformIcon platform={plat} size={14} />
                              </div>
                            ))}
                          </div>
                          <Badge variant="purple" className="text-[10px] py-0 px-1.5">
                            {scheduledTime}
                          </Badge>
                        </div>
                        <p className="text-foreground font-medium truncate max-w-lg">
                          {post.content || "Empty content"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                          <Link href={`/app/create?edit=${post.id}`}>Edit</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Quick Creation Card */}
          <Card className="bg-gradient-to-r from-violet-950/20 via-purple-950/10 to-transparent border-violet-500/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span>Synthesize content with Saucer AI</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Transform raw notes into engaging, tailored posts for Instagram, Facebook, LinkedIn, and YouTube simultaneously.
                </p>
              </div>
              <Button variant="gradient" size="sm" asChild className="shrink-0">
                <Link href="/app/ai">Open AI Studio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Channels & Activity */}
        <div className="space-y-6">
          {/* Connected Channels Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-bold">Connected Channels</CardTitle>
                <CardDescription className="text-xs">
                  {connectedAccounts.length} Connected
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs p-1">
                <Link href="/app/social-accounts">
                  <Plus className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-0">
              {loading ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  Loading accounts...
                </div>
              ) : connectedAccounts.length === 0 ? (
                <div className="py-6 text-center space-y-2 border border-dashed rounded-lg">
                  <p className="text-xs text-muted-foreground">No channels connected yet.</p>
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href="/app/social-accounts">Connect a Channel</Link>
                  </Button>
                </div>
              ) : (
                connectedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlatformIcon platform={account.provider?.toLowerCase()} size={18} />
                      <div>
                        <div className="font-semibold text-foreground">{account.accountName}</div>
                        <div className="text-[10px] text-muted-foreground">{account.accountHandle || account.accountType}</div>
                      </div>
                    </div>
                    <Badge variant="success" className="text-[10px]">
                      {account.connectionStatus}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Workspace Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Workspace Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <span className="text-foreground leading-snug block">Active Organization</span>
                  <span className="text-[10px] text-muted-foreground">{organization?.name || "Personal Org"}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                <div>
                  <span className="text-foreground leading-snug block">Current Workspace</span>
                  <span className="text-[10px] text-muted-foreground">{currentWorkspace?.name || "Main Workspace"}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <span className="text-foreground leading-snug block">User Identity</span>
                  <span className="text-[10px] text-muted-foreground">{user?.email || "Authenticated"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
