"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlatformIcon } from "@/components/platform-icon";
import { PostPreviewCard } from "@/components/post-preview-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Send,
  Save,
  Check,
  Hash,
  Smile,
  AlertCircle,
  HelpCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface SocialAccountOption {
  id: string;
  provider: string;
  accountName: string;
  accountHandle?: string;
  avatarUrl?: string;
}

export default function PostComposerPage() {
  const [accounts, setAccounts] = useState<SocialAccountOption[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("master");
  
  const [masterContent, setMasterContent] = useState("");
  const [channelContent, setChannelContent] = useState<Record<string, string>>({});
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [hasMedia, setHasMedia] = useState(false);

  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date(Date.now() + 24 * 3600 * 1000);
    return d.toISOString().split("T")[0];
  });
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastPublishedPost, setLastPublishedPost] = useState<any>(null);

  // Load connected accounts
  useEffect(() => {
    async function loadAccounts() {
      try {
        setLoadingAccounts(true);
        const res = await fetch("/api/social/accounts");
        if (res.ok) {
          const data = await res.json();
          const list: SocialAccountOption[] = (data.accounts || []).map((acc: any) => ({
            id: acc.id,
            provider: acc.provider,
            accountName: acc.accountName,
            accountHandle: acc.accountHandle,
            avatarUrl: acc.avatarUrl,
          }));
          setAccounts(list);
          if (list.length > 0) {
            setSelectedAccountIds([list[0].id]);
          }
        }
      } catch (err: any) {
        console.error("Failed to load accounts:", err);
      } finally {
        setLoadingAccounts(false);
      }
    }
    loadAccounts();
  }, []);

  const toggleAccount = (id: string) => {
    if (selectedAccountIds.includes(id)) {
      if (selectedAccountIds.length === 1) {
        toast.error("At least one social channel must be selected.");
        return;
      }
      setSelectedAccountIds(selectedAccountIds.filter((accId) => accId !== id));
    } else {
      setSelectedAccountIds([...selectedAccountIds, id]);
    }
  };

  const getActiveContent = () => {
    if (activeTab === "master") return masterContent;
    return channelContent[activeTab] || masterContent;
  };

  const handleContentChange = (val: string) => {
    if (activeTab === "master") {
      setMasterContent(val);
    } else {
      setChannelContent((prev) => ({ ...prev, [activeTab]: val }));
    }
  };

  const selectedAccounts = accounts.filter((a) => selectedAccountIds.includes(a.id));

  // Character limit calculation
  const charLimits: Record<string, number> = {
    INSTAGRAM: 2200,
    FACEBOOK: 63206,
    LINKEDIN: 3000,
    LINKEDIN_PAGE: 3000,
    YOUTUBE: 5000,
    PINTEREST: 500,
    master: 2200,
  };

  const currentTabAccount = accounts.find((a) => a.id === activeTab);
  const currentLimit = currentTabAccount ? (charLimits[currentTabAccount.provider] || 3000) : 2200;
  const currentText = getActiveContent();
  const isOverLimit = currentText.length > currentLimit;

  // Build variants payload
  const buildVariantsPayload = () => {
    return selectedAccounts.map((acc) => {
      const caption = channelContent[acc.id] || masterContent;
      const mediaList = hasMedia && mediaUrl.trim()
        ? [{ url: mediaUrl.trim(), mediaType }]
        : [];
      return {
        socialAccountId: acc.id,
        platform: acc.provider,
        caption,
        mediaConfig: mediaList,
        platformMetadata: {},
      };
    });
  };

  const handleSaveDraft = async () => {
    if (!masterContent.trim() && Object.values(channelContent).every((c) => !c.trim())) {
      toast.error("Please enter post content before saving draft.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/publishing/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: masterContent,
          scheduledAt: null,
          timezone,
          publishNow: false,
          variants: buildVariantsPayload(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft.");

      toast.success("Draft saved successfully to workspace!");
      setLastPublishedPost(data.post);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedule = async () => {
    if (!masterContent.trim() && Object.values(channelContent).every((c) => !c.trim())) {
      toast.error("Please enter post content before scheduling.");
      return;
    }

    try {
      setIsSubmitting(true);
      const combinedDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
      if (isNaN(combinedDateTime.getTime()) || combinedDateTime.getTime() <= Date.now()) {
        toast.error("Please select a valid future date and time for scheduling.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/publishing/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: masterContent,
          scheduledAt: combinedDateTime.toISOString(),
          timezone,
          publishNow: false,
          variants: buildVariantsPayload(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule post.");

      toast.success(`Post successfully scheduled for ${scheduledDate} at ${scheduledTime} (${timezone})!`);
      setLastPublishedPost(data.post);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishNow = async () => {
    if (!masterContent.trim() && Object.values(channelContent).every((c) => !c.trim())) {
      toast.error("Please enter post content before publishing.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/publishing/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: masterContent,
          scheduledAt: null,
          timezone,
          publishNow: true,
          variants: buildVariantsPayload(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish post.");

      setLastPublishedPost(data.post);
      const status = data.post?.status;

      if (status === "PUBLISHED") {
        toast.success("Broadcast successfully published across all selected channels!");
      } else if (status === "PARTIALLY_PUBLISHED") {
        toast.warning("Broadcast partially published: some channels succeeded, others failed.");
      } else {
        toast.error(`Publishing failed or queued: ${status}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Centralized Post Composer
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Create once, tailor individually, and schedule across multiple platforms simultaneously.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSubmitting}>
            <Save className="w-3.5 h-3.5 mr-1" />
            <span>Save Draft</span>
          </Button>
          <Button variant="gradient" size="sm" onClick={handleSchedule} disabled={isSubmitting}>
            <Calendar className="w-3.5 h-3.5 mr-1" />
            <span>Schedule Post</span>
          </Button>
          <Button variant="default" size="sm" onClick={handlePublishNow} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 mr-1" />
            )}
            <span>Publish Now</span>
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Composer Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Channel Selector */}
          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                1. Select Target Social Accounts
              </span>
              <Link
                href="/app/social-accounts"
                className="text-xs text-violet-500 hover:underline flex items-center gap-1"
              >
                <span>Manage Accounts</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {loadingAccounts ? (
              <div className="py-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                <span>Loading connected accounts...</span>
              </div>
            ) : accounts.length === 0 ? (
              <div className="py-4 border border-dashed rounded-lg text-center p-4">
                <p className="text-xs text-muted-foreground mb-2">No social accounts connected yet.</p>
                <Link href="/app/social-accounts">
                  <Button size="sm" variant="outline">Connect Social Accounts</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {accounts.map((acc) => {
                  const isSelected = selectedAccountIds.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => toggleAccount(acc.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? "border-violet-500 bg-violet-600/15 text-foreground font-semibold shadow-xs"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <PlatformIcon platform={acc.provider.toLowerCase()} className="w-3.5 h-3.5" />
                      <span>{acc.accountName}</span>
                      {isSelected && <Check className="w-3 h-3 text-violet-500 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Content Editor with Tabs */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                2. Craft Content & Platform Overrides
              </span>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-muted/60 p-1 flex-wrap h-auto gap-1">
                <TabsTrigger value="master" className="text-xs">
                  Master Copy
                </TabsTrigger>
                {selectedAccounts.map((acc) => (
                  <TabsTrigger key={acc.id} value={acc.id} className="text-xs flex items-center gap-1.5">
                    <PlatformIcon platform={acc.provider.toLowerCase()} className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{acc.accountName}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-3 relative">
                <Textarea
                  value={getActiveContent()}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={
                    activeTab === "master"
                      ? "Write your universal update here... (Individual tabs allow per-platform customization)"
                      : `Custom caption for ${currentTabAccount?.accountName || "this platform"}...`
                  }
                  className="min-h-[140px] text-sm resize-none focus-visible:ring-violet-500"
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 px-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHasMedia(!hasMedia)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs transition-colors ${
                        hasMedia ? "border-violet-500 bg-violet-500/10 text-violet-400" : "border-border hover:bg-muted"
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>{hasMedia ? "Media Attached" : "Attach Media"}</span>
                    </button>
                  </div>
                  <span className={isOverLimit ? "text-destructive font-semibold" : ""}>
                    {currentText.length} / {currentLimit}
                  </span>
                </div>

                {/* Media Configuration Input */}
                {hasMedia && (
                  <div className="mt-3 p-3 border rounded-lg bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">Media Attachment URL</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setMediaType("image")}
                          className={`text-xs px-2 py-0.5 rounded ${mediaType === "image" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                        >
                          Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setMediaType("video")}
                          className={`text-xs px-2 py-0.5 rounded ${mediaType === "video" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                        >
                          Video
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://example.com/asset.jpg (or Supabase Storage URL)"
                      className="w-full text-xs px-3 py-1.5 rounded border bg-background"
                    />
                  </div>
                )}
              </div>
            </Tabs>
          </Card>

          {/* Scheduling Configuration Card */}
          <Card className="p-5 space-y-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              3. Scheduling & Timezone
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Time (24h)</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-background"
                />
              </div>
            </div>
          </Card>

          {/* Last Published Outcomes Display */}
          {lastPublishedPost && (
            <Card className="p-4 border-violet-500/40 bg-violet-950/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                  Publishing Outcome: {lastPublishedPost.status}
                </span>
                <Badge variant={lastPublishedPost.status === "PUBLISHED" ? "default" : "secondary"}>
                  {lastPublishedPost.status}
                </Badge>
              </div>
              <div className="space-y-1.5 pt-1">
                {lastPublishedPost.variants?.map((v: any) => (
                  <div key={v.id} className="text-xs flex items-center justify-between py-1 border-b border-border/50">
                    <span className="font-medium text-foreground">{v.platform}</span>
                    <span className={v.status === "PUBLISHED" ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                      {v.status} {v.externalPostId ? `(#${v.externalPostId.slice(-8)})` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Col: Live Platform Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Live Preview
            </span>
            <Badge variant="outline" className="text-xs">
              {currentTabAccount?.provider || "Universal"}
            </Badge>
          </div>

          <PostPreviewCard
            platform={(currentTabAccount?.provider.toLowerCase() || "x") as any}
            content={getActiveContent() || "Preview copy will appear here dynamically as you craft your broadcast..."}
            authorName={currentTabAccount?.accountName || "Your Brand"}
            authorHandle={currentTabAccount?.accountHandle || "@yourbrand"}
            authorAvatar={currentTabAccount?.avatarUrl}
            mediaUrls={hasMedia && mediaUrl ? [mediaUrl] : []}
          />
        </div>
      </div>
    </div>
  );
}
