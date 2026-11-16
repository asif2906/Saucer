"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlatformIcon } from "@/components/platform-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Edit3,
  Plus,
  RotateCw,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface VariantItem {
  id: string;
  platform: string;
  caption: string;
  status: string;
  externalPostId?: string | null;
  errorMessage?: string | null;
  retryCount: number;
  socialAccount?: {
    accountName: string;
    accountHandle?: string;
  };
  jobs: Array<{
    id: string;
    status: string;
    attemptCount: number;
    nextRetryAt?: string | null;
    attempts: Array<{
      id: string;
      attemptNumber: number;
      outcome: string;
      providerErrorCode?: string | null;
      safeErrorMessage?: string | null;
      completedAt?: string | null;
    }>;
  }>;
}

interface PostItem {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  variants: VariantItem[];
}

export default function PublishingQueuePage() {
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/publishing/posts?view=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err: any) {
      console.error("Failed to load publishing queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCancelPost = async (postId: string) => {
    try {
      setActionLoading(postId);
      const res = await fetch(`/api/publishing/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel post.");
      }
      toast.success("Scheduled post cancelled successfully.");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const res = await fetch(`/api/publishing/jobs/${jobId}/retry`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Retry failed.");
      }
      const data = await res.json();
      if (data.result?.success) {
        toast.success("Job retried and successfully published!");
      } else {
        toast.error(`Retry attempt completed: ${data.result?.outcome || "Unsuccessful"}`);
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">PUBLISHED</Badge>;
      case "PARTIALLY_PUBLISHED":
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">PARTIAL</Badge>;
      case "SCHEDULED":
        return <Badge className="bg-violet-500/15 text-violet-300 border-violet-500/30">SCHEDULED</Badge>;
      case "QUEUED":
        return <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30">QUEUED</Badge>;
      case "PUBLISHING":
        return <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/30">PUBLISHING</Badge>;
      case "FAILED":
        return <Badge variant="destructive">FAILED</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-violet-500" />
            <span>Publishing Queue & Audit Log</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track multi-platform broadcast executions, manage upcoming schedules, and inspect attempt audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RotateCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button variant="gradient" size="sm" asChild>
            <Link href="/app/create">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Post</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="inline-flex rounded-lg border bg-card p-1 text-xs">
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === "queue"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Upcoming Queue
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === "history"
              ? "bg-violet-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Publishing History & Audit
        </button>
      </div>

      {/* Main Content List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          <span className="text-sm">Loading publishing items...</span>
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {activeTab === "queue" ? "No posts currently in queue" : "No publishing history recorded yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {activeTab === "queue"
              ? "Create or schedule social broadcasts to see them queued here."
              : "Completed and attempted social broadcasts will be archived here."}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/create">Go to Post Composer</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-5 space-y-4">
              {/* Post Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/60 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(post.status)}
                    <span className="text-xs text-muted-foreground">
                      {post.scheduledAt
                        ? `Scheduled for: ${new Date(post.scheduledAt).toLocaleString()}`
                        : `Created: ${new Date(post.createdAt).toLocaleString()}`}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground whitespace-pre-wrap mt-1">
                    {post.content}
                  </p>
                </div>

                {/* Cancel Action (if in queue) */}
                {["SCHEDULED", "QUEUED"].includes(post.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleCancelPost(post.id)}
                    disabled={actionLoading === post.id}
                  >
                    {actionLoading === post.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                    )}
                    <span>Cancel Schedule</span>
                  </Button>
                )}
              </div>

              {/* Platform Variants Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Platform Destinations ({post.variants.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {post.variants.map((v) => {
                    const latestJob = v.jobs?.[0];
                    const latestAttempt = latestJob?.attempts?.[0];

                    return (
                      <div
                        key={v.id}
                        className="p-3 rounded-lg border bg-muted/20 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PlatformIcon platform={v.platform.toLowerCase()} className="w-4 h-4" />
                            <span className="font-semibold text-foreground">
                              {v.socialAccount?.accountName || v.platform}
                            </span>
                          </div>
                          {getStatusBadge(v.status)}
                        </div>

                        {/* External Post ID or Error */}
                        {v.externalPostId && (
                          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                            <span>Post ID: {v.externalPostId}</span>
                          </div>
                        )}

                        {v.errorMessage && (
                          <div className="text-[11px] text-destructive flex items-start gap-1 bg-destructive/10 p-1.5 rounded">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{v.errorMessage}</span>
                          </div>
                        )}

                        {/* Retry Button if Failed */}
                        {v.status === "FAILED" && latestJob && (
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">
                              Attempts: {v.retryCount}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleRetryJob(latestJob.id)}
                              disabled={actionLoading === latestJob.id}
                            >
                              {actionLoading === latestJob.id ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <RotateCw className="w-3 h-3 mr-1" />
                              )}
                              <span>Manual Retry</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
