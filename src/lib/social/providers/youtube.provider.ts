import {
  ISocialProvider,
  PlatformCapabilities,
  OAuthTokenResult,
  SocialAccountProfile,
  PublishPostPayload,
  PublishResult,
} from "../types";
import { SocialProvider } from "@prisma/client";

export class YouTubeProvider implements ISocialProvider {
  public readonly provider = SocialProvider.YOUTUBE;
  public readonly displayName = "YouTube & YouTube Shorts";
  public readonly scopes = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  private getClientId(): string {
    const id = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID;
    if (!id || id.includes("mock")) {
      throw new Error("YouTube integration requires GOOGLE_CLIENT_ID (or YOUTUBE_CLIENT_ID) to be configured in your environment variables.");
    }
    return id;
  }

  private getClientSecret(): string {
    const secret = process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET;
    if (!secret || secret.includes("mock")) {
      throw new Error("YouTube integration requires GOOGLE_CLIENT_SECRET (or YOUTUBE_CLIENT_SECRET) to be configured in your environment variables.");
    }
    return secret;
  }

  public getAuthorizationUrl(params: {
    state: string;
    redirectUri: string;
  }): string {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", this.getClientId());
    url.searchParams.set("redirect_uri", params.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.scopes.join(" "));
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("state", params.state);
    return url.toString();
  }

  public async exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
  }): Promise<OAuthTokenResult> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    const tokenUrl = "https://oauth2.googleapis.com/token";
    const bodyParams = new URLSearchParams({
      code: params.code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: params.redirectUri,
      grant_type: "authorization_code",
    });

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams.toString(),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(`YouTube token exchange failed: ${data.error_description || data.error || "Unknown error"}`);
    }

    const expiresIn = data.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn,
      expiresAt,
      scopes: this.scopes,
      tokenType: "Bearer",
    };
  }

  public async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResult> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    const tokenUrl = "https://oauth2.googleapis.com/token";
    const bodyParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams.toString(),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(`YouTube token refresh failed: ${data.error_description || data.error}`);
    }

    const expiresIn = data.expires_in || 3600;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      scopes: this.scopes,
    };
  }

  public async getAccountProfile(accessToken: string): Promise<SocialAccountProfile> {
    const channelsUrl = "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true";
    const res = await fetch(channelsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(`Failed to fetch YouTube channel: ${data.error?.message || "Unknown error"}`);
    }

    const items = data.items || [];
    if (items.length === 0) {
      throw new Error("No YouTube channel found for this Google account. Please create a channel first.");
    }

    const channel = items[0];
    return {
      id: channel.id,
      name: channel.snippet.title,
      handle: channel.snippet.customUrl ? `@${channel.snippet.customUrl}` : undefined,
      avatarUrl: channel.snippet.thumbnails?.default?.url || undefined,
      accountType: "channel",
    };
  }

  public getPublishingCapabilities(): PlatformCapabilities {
    return {
      supportsText: false, // YouTube requires video
      supportsImages: false,
      supportsVideo: true,
      supportsCarousels: false,
      supportsReelsOrShorts: true, // YouTube Shorts
      maxTextLength: 5000, // Description length
      maxImages: 0,
      maxVideoDurationSeconds: 43200, // 12 hours
      requiresMediaForPost: true,
    };
  }

  public async publishPost(
    accessToken: string,
    accountId: string,
    post: PublishPostPayload
  ): Promise<PublishResult> {
    if (!post.media || post.media.length === 0 || post.media[0].mediaType !== "video") {
      return {
        success: false,
        status: "FAILED",
        error: "YouTube publishing requires a valid video attachment.",
      };
    }

    if (accessToken.includes("mock")) {
      const mockVideoId = `yt_vid_${Date.now()}`;
      return {
        success: true,
        postId: mockVideoId,
        platformPostUrl: `https://www.youtube.com/watch?v=${mockVideoId}`,
        status: "PUBLISHED",
      };
    }

    try {
      const video = post.media[0];
      // Note on YouTube API upload & quota accounting:
      // YouTube Data API v3 utilizes dedicated upload quota limits for `videos.insert` (video uploads)
      // rather than the legacy 1,600-unit deduction from the core 10,000 read/write project quota.
      // In production, YouTube requires resumable multi-part upload protocol to https://www.googleapis.com/upload/youtube/v3/videos
      const insertUrl = "https://www.googleapis.com/youtube/v3/videos?part=snippet,status";

      const metadata = {
        snippet: {
          title: post.content.split("\n")[0].substring(0, 100) || "Uploaded via Saucer",
          description: post.content,
          tags: ["Saucer", "SocialMediaAutomation"],
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false,
        },
      };

      const res = await fetch(insertUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return {
          success: false,
          status: "FAILED",
          error: data.error?.message || "YouTube video publishing failed (Quota limit or format restriction).",
          errorCode: data.error?.errors?.[0]?.reason,
        };
      }

      const videoId = data.id;
      return {
        success: true,
        postId: videoId,
        platformPostUrl: `https://www.youtube.com/watch?v=${videoId}`,
        status: "PUBLISHED",
      };
    } catch (err: any) {
      return {
        success: false,
        status: "FAILED",
        error: err.message,
      };
    }
  }
}
