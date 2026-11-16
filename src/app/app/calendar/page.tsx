"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/platform-icon";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Clock,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";

interface PostItem {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  variants: Array<{
    id: string;
    platform: string;
    caption: string;
    status: string;
    socialAccount?: {
      accountName: string;
    };
  }>;
}

export default function VisualCalendarPage() {
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const loadCalendarPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/publishing/posts?view=calendar");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err: any) {
      console.error("Failed to load calendar posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarPosts();
  }, []);

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() - 1);
    else if (viewMode === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + 1);
    else if (viewMode === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleReschedule = async (postId: string, newDateString: string) => {
    try {
      const res = await fetch(`/api/publishing/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: new Date(newDateString).toISOString() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Rescheduling failed.");
      }
      toast.success("Post successfully rescheduled!");
      loadCalendarPosts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (selectedPlatform === "all") return true;
    return p.variants.some((v) => v.platform.toLowerCase() === selectedPlatform.toLowerCase());
  });

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper to map posts to days
  const getPostsForDay = (day: number) => {
    return filteredPosts.filter((p) => {
      const targetDate = p.scheduledAt ? new Date(p.scheduledAt) : new Date(p.createdAt);
      return (
        targetDate.getFullYear() === year &&
        targetDate.getMonth() === month &&
        targetDate.getDate() === day
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-violet-500" />
            <span>Visual Content Calendar</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real database-backed visual scheduling with platform filtering and rescheduling.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border bg-card p-1 text-xs">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === "day"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Day
            </button>
          </div>

          <Button variant="gradient" size="sm" asChild>
            <Link href="/app/create">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Schedule Post</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation and Filters */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-foreground">
              {monthName} {year}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-xs px-2 py-1 rounded border hover:bg-muted text-muted-foreground"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Filter:</span>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="text-xs rounded border bg-background px-2 py-1"
            >
              <option value="all">All Channels</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="pinterest">Pinterest</option>
            </select>
            <button
              onClick={loadCalendarPosts}
              className="p-1 rounded border hover:bg-muted text-muted-foreground"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Calendar Grid View */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          <span className="text-sm">Loading calendar posts from database...</span>
        </div>
      ) : viewMode === "month" ? (
        <Card className="p-4 overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 pb-2 border-b border-border text-center text-xs font-semibold text-muted-foreground">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-2 pt-2">
            {/* Blank leading slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[100px] rounded-lg bg-muted/10 p-1 opacity-40 border border-transparent" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dayPosts = getPostsForDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={day}
                  className={`min-h-[110px] rounded-lg border p-1.5 flex flex-col justify-between transition-colors ${
                    isToday ? "border-violet-500/60 bg-violet-950/10" : "border-border/60 bg-card hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isToday ? "text-violet-400 font-bold" : "text-muted-foreground"}`}>
                      {day}
                    </span>
                    {dayPosts.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1">
                        {dayPosts.length}
                      </Badge>
                    )}
                  </div>

                  {/* Day Posts List */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[80px]">
                    {dayPosts.map((post) => {
                      const platform = post.variants[0]?.platform?.toLowerCase() || "x";
                      const statusColor =
                        post.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : post.status === "PARTIALLY_PUBLISHED"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : post.status === "FAILED"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-violet-500/10 text-violet-300 border-violet-500/20";

                      return (
                        <div
                          key={post.id}
                          className={`text-[10px] p-1 rounded border flex items-center gap-1 truncate ${statusColor}`}
                          title={`${post.content} (${post.status})`}
                        >
                          <PlatformIcon platform={platform} className="w-3 h-3 shrink-0" />
                          <span className="truncate">{post.content.slice(0, 20)}...</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* Week & Day List Mode */
        <Card className="p-4 space-y-3">
          <div className="text-sm font-semibold text-foreground">
            {viewMode === "week" ? "Week View Agenda" : "Day View Agenda"}
          </div>
          {filteredPosts.length === 0 ? (
            <div className="text-xs text-muted-foreground py-8 text-center">
              No posts scheduled for this period.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-lg border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <PlatformIcon
                      platform={post.variants[0]?.platform?.toLowerCase() || "x"}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="text-xs font-medium text-foreground">{post.content}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {post.scheduledAt
                          ? `Scheduled: ${new Date(post.scheduledAt).toLocaleString()}`
                          : `Created: ${new Date(post.createdAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
