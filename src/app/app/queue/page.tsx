"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlatformIcon } from "@/components/platform-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertCircle, FileText, Trash2, Edit3, Plus } from "lucide-react";
import { toast } from "sonner";

export default function PublishingQueuePage() {
  const [filter, setFilter] = useState<string>("all");

  const queueItems = [
    {
      id: "q_1",
      platforms: ["x", "linkedin"],
      content: "Announcing our new multi-channel scheduling features. Manage X, LinkedIn and Meta from one orbit! 🚀",
      scheduledDate: "Today",
      scheduledTime: "4:30 PM UTC",
      state: "QUEUE",
    },
    {
      id: "q_2",
      platforms: ["linkedin"],
      content: "3 key lessons learned while migrating to a unified SaaS architecture. A breakdown for engineering leads...",
      scheduledDate: "Tomorrow",
      scheduledTime: "10:00 AM UTC",
      state: "QUEUE",
    },
    {
      id: "q_3",
      platforms: ["instagram"],
      content: "Behind the scenes at Saucer HQ. Crafting the next generation of social automation tools.",
      scheduledDate: "Nov 22, 2026",
      scheduledTime: "2:00 PM UTC",
      state: "QUEUE",
    },
    {
      id: "q_4",
      platforms: ["x"],
      content: "Black Friday teaser campaign outline #buildinpublic",
      scheduledDate: "Draft",
      scheduledTime: "Unscheduled",
      state: "DRAFT",
    },
    {
      id: "q_5",
      platforms: ["x", "linkedin"],
      content: "Official launch announcement broadcast.",
      scheduledDate: "Nov 14, 2026",
      scheduledTime: "Published",
      state: "PUBLISHED",
    },
  ];

  const filteredItems = queueItems.filter((item) => {
    if (filter === "all") return true;
    return item.state.toLowerCase() === filter.toLowerCase();
  });

  const handleDelete = (id: string) => {
    toast.success("Post removed from queue.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="w-6 h-6 text-violet-500" />
            <span>Publishing Queue</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Trace in-flight scheduled posts, drafts, and past publishing executions.
          </p>
        </div>

        <Button variant="gradient" size="sm" asChild>
          <Link href="/app/create">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add to Queue</span>
          </Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b pb-3">
        {[
          { id: "all", label: "All Items" },
          { id: "queue", label: "Scheduled (3)" },
          { id: "draft", label: "Drafts (1)" },
          { id: "published", label: "Published (1)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.id
                ? "bg-violet-600 text-white font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Queue Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-1">
                  {item.platforms.map((plat) => (
                    <div key={plat} className="p-1 rounded-full bg-background border shadow-xs">
                      <PlatformIcon platform={plat} size={13} />
                    </div>
                  ))}
                </div>

                <Badge
                  variant={
                    item.state === "QUEUE"
                      ? "purple"
                      : item.state === "PUBLISHED"
                      ? "success"
                      : "secondary"
                  }
                  className="text-[10px] py-0 px-2"
                >
                  {item.state}
                </Badge>

                <span className="text-xs text-muted-foreground font-medium">
                  {item.scheduledDate} • {item.scheduledTime}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-foreground font-medium line-clamp-2">
                {item.content}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                <Link href={`/app/create?edit=${item.id}`}>
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  <span>Edit</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(item.id)}
                className="h-8 text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

