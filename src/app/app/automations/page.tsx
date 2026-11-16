"use client";

import { useState } from "react";
import { 
  Rss, 
  Webhook, 
  Plus, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Play, 
  Pause, 
  Activity, 
  AlertCircle,
  Copy,
  Clock,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/platform-icon";

interface RssFeed {
  id: string;
  name: string;
  url: string;
  interval: string;
  targetPlatforms: string[];
  template: string;
  isActive: boolean;
  lastRun: string;
  publishedCount: number;
}

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastStatus: number;
  lastDelivery: string;
}

const INITIAL_FEEDS: RssFeed[] = [
  {
    id: "feed-1",
    name: "Engineering Blog RSS",
    url: "https://saucer.app/blog/rss.xml",
    interval: "Every 30 min",
    targetPlatforms: ["twitter", "linkedin"],
    template: "New blog post: {title} {link} #tech",
    isActive: true,
    lastRun: "18 minutes ago",
    publishedCount: 24,
  },
  {
    id: "feed-2",
    name: "Product Releases",
    url: "https://github.com/saucer/saucer/releases.atom",
    interval: "Every 1 hour",
    targetPlatforms: ["twitter"],
    template: "Saucer update: {title} is live! Check the release notes: {link}",
    isActive: false,
    lastRun: "3 hours ago",
    publishedCount: 12,
  },
];

const INITIAL_WEBHOOKS: WebhookItem[] = [
  {
    id: "wh-1",
    url: "https://api.internal.company.com/social-events",
    events: ["post.published", "post.failed"],
    isActive: true,
    secret: "whsec_98f4a18274ec...",
    lastStatus: 200,
    lastDelivery: "Nov 16, 21:40 UTC",
  },
];

const AUTOMATION_LOGS = [
  { id: "log-1", time: "18m ago", type: "RSS Feed", name: "Engineering Blog RSS", event: "Fetched 0 new items", status: "Success (200)" },
  { id: "log-2", time: "2h ago", type: "Webhook", name: "Outgoing Dispatch", event: "post.published dispatched", status: "Delivered (200)" },
  { id: "log-3", time: "3h ago", type: "RSS Feed", name: "Product Releases", event: "Paused by user", status: "Idle" },
  { id: "log-4", time: "5h ago", type: "RSS Feed", name: "Engineering Blog RSS", event: "Published post to X & LinkedIn", status: "Success (200)" },
];

export default function AutomationsPage() {
  const [feeds, setFeeds] = useState<RssFeed[]>(INITIAL_FEEDS);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(INITIAL_WEBHOOKS);
  
  // RSS Form
  const [showRssModal, setShowRssModal] = useState(false);
  const [feedName, setFeedName] = useState("");
  const [feedUrl, setFeedUrl] = useState("");
  const [feedTemplate, setFeedTemplate] = useState("New update: {title} - read more: {link}");
  
  // Webhook Form
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleFeedStatus = (id: string) => {
    setFeeds((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f))
    );
  };

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedName.trim() || !feedUrl.trim()) return;

    const newFeed: RssFeed = {
      id: `feed-${Date.now()}`,
      name: feedName.trim(),
      url: feedUrl.trim(),
      interval: "Every 30 min",
      targetPlatforms: ["twitter", "linkedin"],
      template: feedTemplate,
      isActive: true,
      lastRun: "Pending initial poll",
      publishedCount: 0,
    };

    setFeeds((prev) => [...prev, newFeed]);
    setFeedName("");
    setFeedUrl("");
    setShowRssModal(false);
    setFeedback(`RSS Feed automation "${newFeed.name}" created successfully.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;

    const newWh: WebhookItem = {
      id: `wh-${Date.now()}`,
      url: webhookUrl.trim(),
      events: ["post.published", "post.failed"],
      isActive: true,
      secret: `whsec_${Math.random().toString(36).substring(2, 10)}...`,
      lastStatus: 200,
      lastDelivery: "Never (new)",
    };

    setWebhooks((prev) => [...prev, newWh]);
    setWebhookUrl("");
    setShowWebhookModal(false);
    setFeedback(`Webhook endpoint added.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Automations & Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Automate social publishing from RSS feeds and configure outgoing webhook event notifications.
        </p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* RSS to Social Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Rss className="h-5 w-5 text-orange-500" />
              RSS to Social Autoposting
            </h2>
            <p className="text-xs text-muted-foreground">
              Monitor blogs, podcasts, or news feeds and automatically schedule new articles.
            </p>
          </div>

          <Button 
            onClick={() => setShowRssModal(!showRssModal)} 
            size="sm" 
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            {showRssModal ? "Cancel" : "Add RSS Feed"}
          </Button>
        </div>

        {/* RSS Modal / Expandable Form */}
        {showRssModal && (
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Connect New RSS Feed</CardTitle>
              <CardDescription className="text-xs">
                Saucer polls the feed periodically and creates drafts or scheduled posts based on your template.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddFeed}>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Feed Title</label>
                    <Input 
                      placeholder="e.g. Company Blog Feed" 
                      value={feedName} 
                      onChange={(e) => setFeedName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Feed URL (RSS or Atom)</label>
                    <Input 
                      placeholder="https://example.com/feed.xml" 
                      value={feedUrl} 
                      onChange={(e) => setFeedUrl(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Post Format Template</label>
                  <Input 
                    value={feedTemplate} 
                    onChange={(e) => setFeedTemplate(e.target.value)} 
                    placeholder="New post: {title} {link}"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Available tags: <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">{"{title}"}</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">{"{link}"}</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">{"{description}"}</code>
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRssModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Save Feed
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Feeds List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feeds.map((feed) => (
            <Card key={feed.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">{feed.name}</CardTitle>
                    <CardDescription className="text-xs font-mono truncate max-w-[280px]">
                      {feed.url}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={feed.isActive ? "default" : "secondary"}
                    className={feed.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]" : "text-[10px]"}
                  >
                    {feed.isActive ? "Active" : "Paused"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground pb-3">
                <div className="p-2 rounded bg-muted/40 font-mono text-[11px] text-foreground">
                  {feed.template}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span>Target Networks:</span>
                    <div className="flex items-center gap-1">
                      {feed.targetPlatforms.map((p) => (
                        <PlatformIcon key={p} platform={p} size={14} />
                      ))}
                    </div>
                  </div>
                  <div className="font-mono">{feed.publishedCount} published</div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Last checked: {feed.lastRun} ({feed.interval})</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-3 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFeedStatus(feed.id)}
                  className="h-7 text-xs gap-1"
                >
                  {feed.isActive ? (
                    <>
                      <Pause className="h-3 w-3" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Resume
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFeeds((prev) => prev.filter((f) => f.id !== feed.id))}
                  className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Outgoing Webhooks Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Webhook className="h-5 w-5 text-purple-500" />
              Outgoing Webhooks
            </h2>
            <p className="text-xs text-muted-foreground">
              Notify external services, Slack bots, or internal APIs when posts are published or fail.
            </p>
          </div>

          <Button 
            onClick={() => setShowWebhookModal(!showWebhookModal)} 
            variant="outline" 
            size="sm" 
            className="gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            {showWebhookModal ? "Cancel" : "Add Webhook"}
          </Button>
        </div>

        {/* Webhook Form */}
        {showWebhookModal && (
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">New Outgoing Webhook Endpoint</CardTitle>
              <CardDescription className="text-xs">
                HTTPS endpoint that will receive POST requests with HMAC-SHA256 signatures in the headers.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddWebhook}>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Destination URL</label>
                  <Input 
                    type="url" 
                    placeholder="https://api.yourdomain.com/webhooks/saucer" 
                    value={webhookUrl} 
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    required 
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  <Badge variant="outline" className="cursor-pointer bg-primary/10 text-primary">
                    post.published (Active)
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer bg-primary/10 text-primary">
                    post.failed (Active)
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer opacity-60">
                    schedule.created
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer opacity-60">
                    account.disconnected
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowWebhookModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                  Register Webhook
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Webhooks Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground bg-muted/20">
                    <th className="p-3 font-medium">Endpoint URL</th>
                    <th className="p-3 font-medium">Subscribed Events</th>
                    <th className="p-3 font-medium">Secret</th>
                    <th className="p-3 font-medium">Last Status</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {webhooks.map((wh) => (
                    <tr key={wh.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-medium max-w-[240px] truncate">
                        {wh.url}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {wh.events.map((ev) => (
                            <Badge key={ev} variant="outline" className="text-[10px]">
                              {ev}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-muted-foreground">
                        {wh.secret}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          {wh.lastStatus} OK
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setWebhooks((prev) => prev.filter((w) => w.id !== wh.id))}
                          className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Recent Automation Activity Log
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time feed polling and webhook dispatch history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            {AUTOMATION_LOGS.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground w-14 font-mono">{log.time}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {log.type}
                  </Badge>
                  <span className="font-medium text-foreground">{log.name}:</span>
                  <span className="text-muted-foreground">{log.event}</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

