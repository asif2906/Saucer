import {
  ISocialProvider,
  PlatformCapabilities,
  OAuthTokenResult,
  SocialAccountProfile,
  PublishPostPayload,
  PublishResult,
  PublishStatusResult,
} from "../types";
import { SocialProvider } from "@prisma/client";

export class InstagramProvider implements ISocialProvider {
  public readonly provider = SocialProvider.INSTAGRAM;
  public readonly displayName = "Instagram Business & Creator";
  public readonly scopes = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement",
  ];

  private getAppId(): string {
    return process.env.META_APP_ID || process.env.INSTAGRAM_APP_ID || "meta_app_mock_id";
  }

  private getAppSecret(): string {
    return process.env.META_APP_SECRET || process.env.INSTAGRAM_APP_SECRET || "meta_app_mock_secret";
  }

  public getApiVersion(): string {
    return process.env.META_GRAPH_API_VERSION || "v21.0";
  }

  public getAuthorizationUrl(params: {
    state: string;
    redirectUri: string;
  }): string {
    const url = new URL(`https://www.facebook.com/${this.getApiVersion()}/dialog/oauth`);
    url.searchParams.set("client_id", this.getAppId());
    url.searchParams.set("redirect_uri", params.redirectUri);
    url.searchParams.set("state", params.state);
    url.searchParams.set("scope", this.scopes.join(","));
    url.searchParams.set("response_type", "code");
    return url.toString();
  }

  public async exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
  }): Promise<OAuthTokenResult> {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();

    // In local sandbox / testing without live Meta app credentials
    if (appId.includes("mock") || appSecret.includes("mock")) {
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
      return {
        accessToken: `ig_long_lived_token_${Date.now()}`,
        refreshToken: `ig_refresh_token_${Date.now()}`,
        expiresIn: 60 * 24 * 3600,
        expiresAt,
        scopes: this.scopes,
        providerAccountId: `ig_acc_${Date.now()}`,
        tokenType: "Bearer",
      };
    }

    // Step 1: Exchange code for short-lived token
    const tokenUrl = new URL(`https://graph.facebook.com/${this.getApiVersion()}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", params.redirectUri);
    tokenUrl.searchParams.set("code", params.code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      throw new Error(`Instagram token exchange failed: ${tokenData.error?.message || "Unknown error"}`);
    }

    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange for long-lived 60-day token
    const longLivedUrl = new URL(`https://graph.facebook.com/${this.getApiVersion()}/oauth/access_token`);
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", appId);
    longLivedUrl.searchParams.set("client_secret", appSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const longLivedRes = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedRes.json();

    const finalToken = longLivedRes.ok && longLivedData.access_token ? longLivedData.access_token : shortLivedToken;
    const expiresIn = longLivedData.expires_in || 5184000; // 60 days in seconds
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      accessToken: finalToken,
      expiresIn,
      expiresAt,
      scopes: this.scopes,
      tokenType: "Bearer",
    };
  }

  public async refreshAccessToken(currentToken: string): Promise<OAuthTokenResult> {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();

    if (appId.includes("mock") || appSecret.includes("mock")) {
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      return {
        accessToken: `ig_refreshed_token_${Date.now()}`,
        expiresIn: 60 * 24 * 3600,
        expiresAt,
        scopes: this.scopes,
      };
    }

    const refreshUrl = new URL(`https://graph.facebook.com/${this.getApiVersion()}/oauth/access_token`);
    refreshUrl.searchParams.set("grant_type", "fb_exchange_token");
    refreshUrl.searchParams.set("client_id", appId);
    refreshUrl.searchParams.set("client_secret", appSecret);
    refreshUrl.searchParams.set("fb_exchange_token", currentToken);

    const res = await fetch(refreshUrl.toString());
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(`Instagram token refresh failed: ${data.error?.message || "Unknown error"}`);
    }

    const expiresIn = data.expires_in || 5184000;
    return {
      accessToken: data.access_token,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      scopes: this.scopes,
    };
  }

  public async getAccountProfile(accessToken: string): Promise<SocialAccountProfile> {
    if (accessToken.includes("mock")) {
      return {
        id: "ig_business_10829182",
        name: "Acme Creative Studio",
        handle: "acme.studio",
        accountType: "business",
        avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
      };
    }

    // Discover Instagram Business Accounts via Facebook Pages
    const accountsUrl = `https://graph.facebook.com/${this.getApiVersion()}/me/accounts?fields=id,name,instagram_business_account{id,username,name,profile_picture_url}&access_token=${accessToken}`;
    const res = await fetch(accountsUrl);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(`Failed to fetch Instagram accounts: ${data.error?.message || "Unknown error"}`);
    }

    const pages = data.data || [];
    for (const page of pages) {
      if (page.instagram_business_account) {
        const ig = page.instagram_business_account;
        return {
          id: ig.id,
          name: ig.name || ig.username || page.name,
          handle: ig.username ? `@${ig.username}` : undefined,
          avatarUrl: ig.profile_picture_url || undefined,
          accountType: "business",
          metadata: { pageId: page.id, pageName: page.name },
        };
      }
    }

    throw new Error(
      "No professional Instagram Business or Creator account found linked to your Facebook Pages. Please ensure your Instagram account is set to Business/Creator and connected to a Facebook Page."
    );
  }

  public getPublishingCapabilities(): PlatformCapabilities {
    return {
      supportsText: true,
      supportsImages: true,
      supportsVideo: true,
      supportsCarousels: true,
      supportsReelsOrShorts: true,
      maxTextLength: 2200,
      maxImages: 10,
      maxVideoDurationSeconds: 900, // 15 mins for standard Reels
      requiresMediaForPost: true, // Instagram requires media
    };
  }

  public async publishPost(
    accessToken: string,
    accountId: string,
    post: PublishPostPayload
  ): Promise<PublishResult> {
    if (!post.media || post.media.length === 0) {
      return {
        success: false,
        status: "FAILED",
        error: "Instagram publishing requires at least one image or video attachment.",
      };
    }

    if (accessToken.includes("mock")) {
      const mockPostId = `ig_post_${Date.now()}`;
      return {
        success: true,
        postId: mockPostId,
        platformPostUrl: `https://www.instagram.com/p/${mockPostId}/`,
        status: "PUBLISHED",
      };
    }

    try {
      // 1. Create Media Container
      const firstMedia = post.media[0];
      const isVideo = firstMedia.mediaType === "video";
      const containerUrl = `https://graph.facebook.com/${this.getApiVersion()}/${accountId}/media`;

      const containerParams: Record<string, string> = {
        access_token: accessToken,
        caption: post.content,
      };

      if (isVideo) {
        containerParams.media_type = "REELS";
        containerParams.video_url = firstMedia.url;
      } else {
        containerParams.image_url = firstMedia.url;
      }

      const containerRes = await fetch(containerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(containerParams),
      });

      const containerData = await containerRes.json();
      if (!containerRes.ok || containerData.error) {
        return {
          success: false,
          status: "FAILED",
          error: containerData.error?.message || "Failed to create Instagram media container.",
          errorCode: containerData.error?.code?.toString(),
        };
      }

      const creationId = containerData.id;

      // 2. Publish Container
      const publishUrl = `https://graph.facebook.com/${this.getApiVersion()}/${accountId}/media_publish`;
      const publishRes = await fetch(publishUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      });

      const publishData = await publishRes.json();
      if (!publishRes.ok || publishData.error) {
        return {
          success: false,
          status: "FAILED",
          error: publishData.error?.message || "Failed to publish Instagram media container.",
          errorCode: publishData.error?.code?.toString(),
        };
      }

      const publishedMediaId = publishData.id;
      return {
        success: true,
        postId: publishedMediaId,
        platformPostUrl: `https://www.instagram.com/p/${publishedMediaId}/`,
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

  public async checkPostStatus(
    accessToken: string,
    publishJobId: string
  ): Promise<PublishStatusResult> {
    if (accessToken.includes("mock")) {
      return { status: "PUBLISHED", platformPostId: publishJobId };
    }

    try {
      const statusUrl = `https://graph.facebook.com/${this.getApiVersion()}/${publishJobId}?fields=status_code&access_token=${accessToken}`;
      const res = await fetch(statusUrl);
      const data = await res.json();

      if (data.status_code === "FINISHED") {
        return { status: "PUBLISHED", platformPostId: publishJobId };
      }
      if (data.status_code === "IN_PROGRESS") {
        return { status: "IN_PROGRESS" };
      }
      return { status: "FAILED", error: data.error?.message || "Publishing processing error" };
    } catch (err: any) {
      return { status: "FAILED", error: err.message };
    }
  }
}
