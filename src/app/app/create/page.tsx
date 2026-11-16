"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

export default function PostComposerPage() {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["x", "linkedin"]);
  const [activeTab, setActiveTab] = useState<string>("master");
  const [masterContent, setMasterContent] = useState("");
  const [xContent, setXContent] = useState("");
  const [linkedinContent, setLinkedinContent] = useState("");
  const [instagramContent, setInstagramContent] = useState("");
  const [previewPlatform, setPreviewPlatform] = useState<string>("x");
  const [scheduledDate, setScheduledDate] = useState("2026-11-20");
  const [scheduledTime, setScheduledTime] = useState("16:30");
  const [hasMedia, setHasMedia] = useState(false);

  const availableChannels = [
    { id: "x", name: "X (@acmeorbit)" },
    { id: "linkedin", name: "LinkedIn (Acme Media)" },
    { id: "instagram", name: "Instagram (@acmevisuals)" },
    { id: "facebook", name: "Facebook (Acme HQ)" },
  ];

  const toggleChannel = (id: string) => {
    if (selectedChannels.includes(id)) {
      if (selectedChannels.length === 1) {
        toast.error("At least one social channel must be selected.");
        return;
      }
      setSelectedChannels(selectedChannels.filter((c) => c !== id));
    } else {
      setSelectedChannels([...selectedChannels, id]);
    }
  };

  const getActiveContent = () => {
    if (activeTab === "x") return xContent || masterContent;
    if (activeTab === "linkedin") return linkedinContent || masterContent;
    if (activeTab === "instagram") return instagramContent || masterContent;
    return masterContent;
  };

  const handleContentChange = (val: string) => {
    if (activeTab === "master") {
      setMasterContent(val);
    } else if (activeTab === "x") {
      setXContent(val);
    } else if (activeTab === "linkedin") {
      setLinkedinContent(val);
    } else if (activeTab === "instagram") {
      setInstagramContent(val);
    }
  };

  const handleSaveDraft = () => {
    if (!masterContent.trim() && !xContent && !linkedinContent) {
      toast.error("Please enter post content before saving draft.");
      return;
    }
    toast.success("Draft saved successfully to workspace!");
  };

  const handleSchedule = () => {
    if (!masterContent.trim() && !xContent && !linkedinContent) {
      toast.error("Please enter post content before scheduling.");
      return;
    }
    toast.success(`Post successfully scheduled for ${scheduledDate} at ${scheduledTime} UTC!`);
  };

  const handlePublishNow = () => {
    if (!masterContent.trim() && !xContent && !linkedinContent) {
      toast.error("Please enter post content before publishing.");
      return;
    }
    toast.success("Broadcast dispatched across connected channels!");
  };

  // Character limit calculation
  const charLimits: Record<string, number> = {
    x: 280,
    linkedin: 3000,
    instagram: 2200,
    master: 280,
  };
  const currentText = getActiveContent();
  const currentLimit = charLimits[activeTab] || 280;
  const isOverLimit = currentText.length > currentLimit;

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
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="w-3.5 h-3.5 mr-1" />
            <span>Save Draft</span>
          </Button>
          <Button variant="gradient" size="sm" onClick={handleSchedule}>
            <Calendar className="w-3.5 h-3.5 mr-1" />
            <span>Schedule Post</span>
          </Button>
          <Button variant="default" size="sm" onClick={handlePublishNow}>
            <Send className="w-3.5 h-3.5 mr-1" />
            <span>Publish Now</span>
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout: Composer (Left) + Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Composer Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Channel Selector Row */}
          <Card className="p-4 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              1. Select Target Social Channels
            </span>
            <div className="flex flex-wrap gap-2.5">
              {availableChannels.map((ch) => {
                const isSelected = selectedChannels.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "border-violet-500 bg-violet-600/15 text-foreground font-semibold shadow-xs"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <PlatformIcon platform={ch.id} size={15} />
                    <span>{ch.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-violet-500 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Platform Customization Tabs */}
          <Card className="p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                2. Craft & Customize Content
              </span>
              <Link
                href="/app/ai"
                className="inline-flex items-center gap-1.5 text-xs text-violet-500 hover:text-violet-400 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Saucer AI</span>
              </Link>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="master" className="text-xs">
                  Master Post
                </TabsTrigger>
                <TabsTrigger value="x" className="text-xs flex items-center gap-1.5">
                  <PlatformIcon platform="x" size={12} />
                  <span>X (Twitter)</span>
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="text-xs flex items-center gap-1.5">
                  <PlatformIcon platform="linkedin" size={12} />
                  <span>LinkedIn</span>
                </TabsTrigger>
                <TabsTrigger value="instagram" className="text-xs flex items-center gap-1.5">
                  <PlatformIcon platform="instagram" size={12} />
                  <span>Instagram</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-3 relative">
                <Textarea
                  value={getActiveContent()}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={
                    activeTab === "master"
                      ? "Write your main message here. It will automatically populate individual channel tabs unless overridden..."
                      : `Customized caption specifically for ${activeTab.toUpperCase()}...`
                  }
                  className="min-h-[180px] text-sm leading-relaxed"
                />

                {/* Character Counter Badge */}
                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => handleContentChange(getActiveContent() + " #SaucerAI #SocialMedia")}
                      className="hover:text-foreground flex items-center gap-1"
                    >
                      <Hash className="w-3.5 h-3.5" /> <span>Add Tags</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleContentChange(getActiveContent() + " 🚀✨")}
                      className="hover:text-foreground flex items-center gap-1"
                    >
                      <Smile className="w-3.5 h-3.5" /> <span>Emojis</span>
                    </button>
                  </div>

                  <span
                    className={`font-semibold ${
                      isOverLimit ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {currentText.length} / {currentLimit} chars
                  </span>
                </div>
              </div>
            </Tabs>

            {/* Media Attachment Dropzone */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                3. Media Attachments
              </span>
              <div
                onClick={() => {
                  setHasMedia(!hasMedia);
                  toast.info(hasMedia ? "Media removed" : "Sample image asset attached to post");
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  hasMedia
                    ? "border-violet-500 bg-violet-600/5"
                    : "border-border hover:border-violet-500/50 hover:bg-muted/30"
                }`}
              >
                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <span className="text-xs font-semibold text-foreground block">
                  {hasMedia ? "1 Image Attached (banner_preview.png)" : "Click to attach images, videos or carousel slides"}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Supports PNG, JPG, MP4 (Max 100MB • Auto-transcoded for social specs)
                </span>
              </div>
            </div>

            {/* Scheduling Date/Time Picker */}
            <div className="pt-2 border-t">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                4. Scheduling Parameters (UTC)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-xs"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-xs"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Live Platform Preview Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <Card className="p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b">
              <span className="text-xs font-bold text-foreground">Live Network Preview</span>
              {/* Platform Switcher Buttons */}
              <div className="flex gap-1.5">
                {["x", "linkedin", "instagram"].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setPreviewPlatform(plat)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      previewPlatform === plat
                        ? "bg-violet-600/15 border-violet-500"
                        : "border-border hover:bg-muted"
                    }`}
                    title={`Preview on ${plat}`}
                  >
                    <PlatformIcon platform={plat} size={14} />
                  </button>
                ))}
              </div>
            </div>

            {/* Render Preview Card */}
            <PostPreviewCard
              platform={previewPlatform}
              content={
                previewPlatform === "x" && xContent
                  ? xContent
                  : previewPlatform === "linkedin" && linkedinContent
                  ? linkedinContent
                  : previewPlatform === "instagram" && instagramContent
                  ? instagramContent
                  : masterContent
              }
              mediaUrls={hasMedia ? ["sample_url"] : []}
              scheduledTime={`${scheduledDate} at ${scheduledTime}`}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
