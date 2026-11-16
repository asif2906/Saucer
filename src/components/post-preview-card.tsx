import React from "react";
import { PlatformIcon } from "@/components/platform-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart, Repeat, Share2, MoreHorizontal, Bookmark } from "lucide-react";

interface PostPreviewCardProps {
  platform: string;
  content: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  mediaUrls?: string[];
  scheduledTime?: string;
}

export function PostPreviewCard({
  platform,
  content,
  authorName = "Acme Orbit",
  authorHandle = "acmeorbit",
  authorAvatar,
  mediaUrls = [],
  scheduledTime,
}: PostPreviewCardProps) {
  const p = platform.toLowerCase();

  // X (Twitter) Preview
  if (p === "x" || p === "twitter") {
    return (
      <div className="rounded-xl border bg-card p-4 shadow-sm text-sm max-w-lg mx-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-2 border-b">
          <div className="flex items-center gap-1.5 font-medium">
            <PlatformIcon platform="x" size={14} />
            <span>X (Twitter) Preview</span>
          </div>
          {scheduledTime && <span>Scheduled: {scheduledTime}</span>}
        </div>

        <div className="flex gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback>AO</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-foreground hover:underline cursor-pointer">
                {authorName}
              </span>
              <span className="text-muted-foreground text-xs">@{authorHandle}</span>
              <span className="text-muted-foreground text-xs">· Just now</span>
            </div>

            <p className="mt-2 text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {content || "What's happening? Type in the composer to preview your post."}
            </p>

            {mediaUrls.length > 0 && (
              <div className="mt-3 rounded-lg overflow-hidden border bg-muted/30 aspect-video flex items-center justify-center text-muted-foreground text-xs">
                <span>[Attached Image Preview]</span>
              </div>
            )}

            <div className="flex justify-between max-w-md mt-4 text-muted-foreground">
              <button className="flex items-center gap-1.5 hover:text-blue-500 text-xs">
                <MessageSquare className="w-4 h-4" /> <span>0</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-green-500 text-xs">
                <Repeat className="w-4 h-4" /> <span>0</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-pink-500 text-xs">
                <Heart className="w-4 h-4" /> <span>0</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-blue-500 text-xs">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LinkedIn Preview
  if (p === "linkedin" || p === "linkedin-page") {
    return (
      <div className="rounded-xl border bg-card p-4 shadow-sm text-sm max-w-lg mx-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-2 border-b">
          <div className="flex items-center gap-1.5 font-medium">
            <PlatformIcon platform="linkedin" size={14} />
            <span>LinkedIn Post Preview</span>
          </div>
          {scheduledTime && <span>Scheduled: {scheduledTime}</span>}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-10 h-10">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>AO</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-foreground leading-tight">{authorName}</div>
              <div className="text-xs text-muted-foreground">Social Growth Leader • 1st</div>
              <div className="text-[10px] text-muted-foreground">Just now • 🌐</div>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </div>

        <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed text-sm">
          {content || "Share your professional milestone or thoughts with your network..."}
        </p>

        {mediaUrls.length > 0 && (
          <div className="mt-3 rounded-lg overflow-hidden border bg-muted/30 aspect-video flex items-center justify-center text-muted-foreground text-xs">
            <span>[Attached Image / Document Preview]</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 mt-3 border-t text-muted-foreground text-xs">
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <Heart className="w-4 h-4" /> <span>Like</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <MessageSquare className="w-4 h-4" /> <span>Comment</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <Repeat className="w-4 h-4" /> <span>Repost</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <Share2 className="w-4 h-4" /> <span>Send</span>
          </button>
        </div>
      </div>
    );
  }

  // Instagram / Default Preview
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm text-sm max-w-sm mx-auto">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-2 border-b">
        <div className="flex items-center gap-1.5 font-medium">
          <PlatformIcon platform="instagram" size={14} />
          <span>Instagram Feed Preview</span>
        </div>
        {scheduledTime && <span>Scheduled</span>}
      </div>

      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Avatar className="w-7 h-7 ring-2 ring-pink-500/30">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback>AO</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-xs text-foreground">{authorHandle}</span>
        </div>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="rounded-lg overflow-hidden border bg-muted/40 aspect-square flex items-center justify-center text-muted-foreground text-xs mb-3">
        <span>[Visual Media Preview]</span>
      </div>

      <div className="flex items-center justify-between mb-2 text-foreground">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 hover:text-pink-500 cursor-pointer" />
          <MessageSquare className="w-5 h-5 cursor-pointer" />
          <Share2 className="w-5 h-5 cursor-pointer" />
        </div>
        <Bookmark className="w-5 h-5 cursor-pointer text-muted-foreground" />
      </div>

      <div className="text-xs">
        <span className="font-bold mr-1.5">{authorHandle}</span>
        <span className="text-foreground whitespace-pre-wrap break-words">
          {content || "Captivating caption with #hashtags and emojis..."}
        </span>
      </div>
    </div>
  );
}

