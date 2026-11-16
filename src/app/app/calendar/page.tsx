"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

export default function VisualCalendarPage() {
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [currentMonth, setCurrentMonth] = useState("November 2026");

  // Sample scheduled posts for visual calendar demonstration
  const calendarPosts = [
    { day: 16, time: "16:30", platform: "x", title: "Product Feature Drop 🚀", status: "scheduled" },
    { day: 17, time: "10:00", platform: "linkedin", title: "Engineering Blog Recap", status: "scheduled" },
    { day: 19, time: "14:15", platform: "instagram", title: "Behind the scenes story", status: "scheduled" },
    { day: 20, time: "11:00", platform: "x", title: "Weekly community Q&A thread", status: "scheduled" },
    { day: 24, time: "09:00", platform: "linkedin", title: "B2B Social Playbook", status: "scheduled" },
    { day: 26, time: "18:00", platform: "youtube", title: "Feature Walkthrough Video", status: "scheduled" },
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // 30 days in November, starting on Sunday (1) for display simulation
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleDragMock = (day: number) => {
    toast.success(`Post rescheduled to Nov ${day}, 2026 (drag-and-drop simulated).`);
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
            Plan, organize, and drag-and-drop scheduled social broadcasts across all channels.
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

      {/* Calendar Filter & Navigation Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl border bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <span className="font-bold text-sm text-foreground">{currentMonth}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Filter Channels (All)</span>
          </Button>
          <Badge variant="purple" className="text-xs">UTC Timezone</Badge>
        </div>
      </div>

      {/* Monthly Grid View */}
      {viewMode === "month" && (
        <Card className="p-0 overflow-hidden shadow-sm">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b bg-muted/40 text-center py-2 text-xs font-semibold text-muted-foreground">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 divide-x divide-y border-b">
            {calendarDays.map((day) => {
              const dayPosts = calendarPosts.filter((p) => p.day === day);
              const isToday = day === 16;

              return (
                <div
                  key={day}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDragMock(day)}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors hover:bg-muted/20 ${
                    isToday ? "bg-violet-600/[0.03]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? "bg-violet-600 text-white"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day}
                    </span>
                    <Link
                      href={`/app/create?date=2026-11-${day < 10 ? "0" + day : day}`}
                      className="opacity-0 hover:opacity-100 text-muted-foreground hover:text-foreground"
                      title="Add post to this day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Scheduled Items for this day */}
                  <div className="space-y-1 my-1">
                    {dayPosts.map((post, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => toast.info("Drag item to another calendar day to reschedule.")}
                        className="p-1.5 rounded-lg border bg-card text-[11px] shadow-xs cursor-grab active:cursor-grabbing hover:border-violet-500/40 flex items-center gap-1.5 transition-all truncate"
                      >
                        <PlatformIcon platform={post.platform} size={12} className="shrink-0" />
                        <span className="truncate font-medium text-foreground">{post.title}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-muted-foreground text-right">
                    {dayPosts.length > 0 && `${dayPosts.length} post`}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Week / Day View Placeholder */}
      {viewMode !== "month" && (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          <Clock className="w-8 h-8 text-violet-500 mx-auto mb-2" />
          <h3 className="font-semibold text-foreground text-base mb-1">
            {viewMode === "week" ? "Weekly Time Slots" : "Daily Queue View"}
          </h3>
          <p className="max-w-md mx-auto text-xs">
            Detailed hourly time grid view showing exact queue placement for November 2026.
          </p>
          <Button variant="outline" size="sm" onClick={() => setViewMode("month")} className="mt-4">
            Switch back to Month view
          </Button>
        </Card>
      )}
    </div>
  );
}

