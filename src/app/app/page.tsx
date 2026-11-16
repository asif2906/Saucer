import React from "react";
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
} from "lucide-react";

export default function DashboardOverviewPage() {
  const connectedAccounts = [
    { id: "x_1", platform: "x", name: "Acme Tech Orbit", handle: "@acmeorbit", status: "Healthy" },
    { id: "li_1", platform: "linkedin", name: "Acme Media Group", handle: "acme-media", status: "Healthy" },
    { id: "ig_1", platform: "instagram", name: "Acme Visuals", handle: "@acmevisuals", status: "Healthy" },
  ];

  const upcomingPosts = [
    {
      id: "post_1",
      platforms: ["x", "linkedin"],
      content: "Announcing our new multi-channel scheduling features. Manage X, LinkedIn and Meta from one orbit! 🚀",
      scheduledFor: "Today, 4:30 PM",
      status: "Scheduled",
    },
    {
      id: "post_2",
      platforms: ["linkedin"],
      content: "3 key lessons learned while migrating to a unified SaaS architecture. A breakdown for engineering leads...",
      scheduledFor: "Tomorrow, 10:00 AM",
      status: "Scheduled",
    },
    {
      id: "post_3",
      platforms: ["instagram"],
      content: "Behind the scenes at Saucer HQ. Crafting the next generation of social automation tools.",
      scheduledFor: "Nov 22, 2:00 PM",
      status: "Scheduled",
    },
  ];

  const recentActivity = [
    { text: "Successfully published post to X and LinkedIn", time: "2 hours ago", status: "success" },
    { text: "Draft saved for upcoming Black Friday campaign", time: "5 hours ago", status: "info" },
    { text: "Connected Instagram Business account (@acmevisuals)", time: "1 day ago", status: "success" },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Workspace Command Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Overview of scheduled broadcasts, channel health, and AI allowances.
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
            <div className="text-2xl font-extrabold text-foreground mt-1">3</div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            Next broadcast: Today at 4:30 PM
          </CardContent>
        </Card>

        <Card className="hover:border-violet-500/30 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Published (This Month)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground mt-1">24</div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            +18% compared to last month
          </CardContent>
        </Card>

        <Card className="hover:border-violet-500/30 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Drafts in Progress</span>
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground mt-1">5</div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            2 pending team review
          </CardContent>
        </Card>

        <Card className="hover:border-violet-500/30 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>AI Free Allowance</span>
              <Sparkles className="w-4 h-4 text-violet-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground mt-1">48 / 50</div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground">
            Free tier quota • Resets in 14 days
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
                  <span>View All Queue</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {upcomingPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-xl border bg-card/60 hover:bg-accent/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {post.platforms.map((plat) => (
                          <div key={plat} className="p-1 rounded-full bg-background border shadow-xs">
                            <PlatformIcon platform={plat} size={14} />
                          </div>
                        ))}
                      </div>
                      <Badge variant="purple" className="text-[10px] py-0 px-1.5">
                        {post.scheduledFor}
                      </Badge>
                    </div>
                    <p className="text-foreground font-medium truncate max-w-lg">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                      <Link href={`/app/create?edit=${post.id}`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
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
                  Transform raw notes into engaging, tailored posts for X, LinkedIn, and Instagram simultaneously.
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
                <CardDescription className="text-xs">3 of 3 Free Slots Active</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs p-1">
                <Link href="/app/social-accounts">
                  <Plus className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-0">
              {connectedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <PlatformIcon platform={account.platform} size={18} />
                    <div>
                      <div className="font-semibold text-foreground">{account.name}</div>
                      <div className="text-[10px] text-muted-foreground">{account.handle}</div>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    {account.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Recent Workspace Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-xs">
              {recentActivity.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-foreground leading-snug block">{act.text}</span>
                    <span className="text-[10px] text-muted-foreground">{act.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

