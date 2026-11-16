import {
  ISocialProvider,
  PlatformCapabilities,
  OAuthTokenResult,
  SocialAccountProfile,
  PublishPostPayload,
  PublishResult,
} from "../types";
import { SocialProvider } from "@prisma/client";

export class FacebookProvider implements ISocialProvider {
  public readonly provider = SocialProvider.FACEBOOK;
  public readonly displayName = "Facebook Pages";
  public readonly scopes = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "public_profile",
  ];

  private getAppId(): string {
    return process.env.META_APP_ID || process.env.FACEBOOK_APP_ID || "meta_app_mock_id";
  }

  private getAppSecret(): string {
    return process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET || "meta_app_mock_secret";
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

    if (appId.includes("mock") || appSecret.includes("mock")) {
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      return {
        accessToken: `fb_page_token_${Date.now()}`,
        refreshToken: `fb_refresh_token_${Date.now()}`,
        expiresIn: 60 * 24 * 3600,
        expiresAt,
        scopes: this.scopes,
        providerAccountId: `fb_page_${Date.now()}`,
        tokenType: "Bearer",
      };
    }

    const tokenUrl = new URL(`https://graph.facebook.com/${this.getApiVersion()}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", params.redirectUri);
    tokenUrl.searchParams.set("code", params.code);

    const res = await fetch(tokenUrl.toString());
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(`Facebook token exchange failed: ${data.error?.message || "Unknown error"}`);
    }

    // Exchange for long-lived token
    const longLivedUrl = new URL(`https://graph.facebook.com/${this.getApiVersion()}/oauth/access_token`);
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", appId);
    longLivedUrl.searchParams.set("client_secret", appSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", data.access_token);

    const longLivedRes = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedRes.json();

    const finalToken = longLivedRes.ok && longLivedData.access_token ? longLivedData.access_token : data.access_token;
    const expiresIn = longLivedData.expires_in || 5184000;

    return {
      accessToken: finalToken,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      scopes: this.scopes,
      tokenType: "Bearer",
    };
  }

  public async getAccountProfile(accessToken: string): Promise<SocialAccountProfile> {
    if (accessToken.includes("mock")) {
      return {
        id: "fb_page_89283749",
        name: "Acme Global Official Page",
        handle: "acmeglobal",
        accountType: "page",
        avatarUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150",
      };
    }

    // Fetch managed Facebook Pages with page-scoped tokens
    const pagesUrl = `https://graph.facebook.com/${this.getApiVersion()}/me/accounts?fields=id,name,category,access_token,picture{url}&access_token=${accessToken}`;
    const res = await fetch(pagesUrl);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(`Failed to fetch Facebook Pages: ${data.error?.message || "Unknown error"}`);
    }

    const pages = data.data || [];
    if (pages.length === 0) {
      throw new Error("No managed Facebook Pages found. You must be an administrator or editor of at least one Facebook Page.");
    }

    const firstPage = pages[0];
    return {
      id: firstPage.id,
      name: firstPage.name,
      accountType: "page",
      avatarUrl: firstPage.picture?.data?.url || undefined,
      metadata: {
        category: firstPage.category,
        pageAccessToken: firstPage.access_token, // Page-specific token
      },
    };
  }

  public getPublishingCapabilities(): PlatformCapabilities {
    return {
      supportsText: true,
      supportsImages: true,
      supportsVideo: true,
      supportsCarousels: true,
      supportsReelsOrShorts: true,
      maxTextLength: 63206,
      maxImages: 10,
      maxVideoDurationSeconds: 14400, // 240 mins
      requiresMediaForPost: false,
    };
  }

  public async publishPost(
    accessToken: string,
    accountId: string,
    post: PublishPostPayload
  ): Promise<PublishResult> {
    if (accessToken.includes("mock")) {
      const mockPostId = `fb_post_${Date.now()}`;
      return {
        success: true,
        postId: mockPostId,
        platformPostUrl: `https://facebook.com/${accountId}/posts/${mockPostId}`,
        status: "PUBLISHED",
      };
    }

    try {
      const hasMedia = post.media && post.media.length > 0;
      let endpoint = `https://graph.facebook.com/${this.getApiVersion()}/${accountId}/feed`;
      const body: Record<string, string> = {
        access_token: accessToken,
      };

      if (!hasMedia) {
        body.message = post.content;
      } else {
        const firstMedia = post.media![0];
        if (firstMedia.mediaType === "video") {
          endpoint = `https://graph.facebook.com/${this.getApiVersion()}/${accountId}/videos`;
          body.file_url = firstMedia.url;
          body.description = post.content;
        } else {
          endpoint = `https://graph.facebook.com/${this.getApiVersion()}/${accountId}/photos`;
          body.url = firstMedia.url;
          body.caption = post.content;
        }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return {
          success: false,
          status: "FAILED",
          error: data.error?.message || "Facebook Page publishing failed.",
          errorCode: data.error?.code?.toString(),
        };
      }

      const postId = data.id || data.post_id;
      return {
        success: true,
        postId,
        platformPostUrl: `https://facebook.com/${postId}`,
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
