import {
  ISocialProvider,
  PlatformCapabilities,
  OAuthTokenResult,
  SocialAccountProfile,
  PublishPostPayload,
  PublishResult,
} from "../types";
import { SocialProvider } from "@prisma/client";

export class PinterestProvider implements ISocialProvider {
  public readonly provider = SocialProvider.PINTEREST;
  public readonly displayName = "Pinterest Pins";
  public readonly scopes = [
    "boards:read",
    "pins:read",
    "pins:write",
    "user_accounts:read",
  ];

  private getAppId(): string {
    return process.env.PINTEREST_APP_ID || "pinterest_mock_app_id";
  }

  private getAppSecret(): string {
    return process.env.PINTEREST_APP_SECRET || "pinterest_mock_app_secret";
  }

  public getAuthorizationUrl(params: {
    state: string;
    redirectUri: string;
  }): string {
    const url = new URL("https://www.pinterest.com/oauth/");
    url.searchParams.set("client_id", this.getAppId());
    url.searchParams.set("redirect_uri", params.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.scopes.join(","));
    url.searchParams.set("state", params.state);
    return url.toString();
  }

  public async exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
  }): Promise<OAuthTokenResult> {
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();

    if (appId.includes("mock") || appSecret.includes("mock")) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
      return {
        accessToken: `pin_access_token_${Date.now()}`,
        refreshToken: `pin_refresh_token_${Date.now()}`,
        expiresIn: 30 * 24 * 3600,
        expiresAt,
        scopes: this.scopes,
        providerAccountId: `pin_user_${Date.now()}`,
        tokenType: "Bearer",
      };
    }

    const tokenUrl = "https://api.pinterest.com/v5/oauth/token";
    const basicAuth = Buffer.from(`${appId}:${appSecret}`).toString("base64");

    const bodyParams = new URLSearchParams({
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: params.redirectUri,
    });

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    const data = await res.json();
    if (!res.ok || data.code || data.message) {
      throw new Error(`Pinterest token exchange failed: ${data.message || "Unknown error"}`);
    }

    const expiresIn = data.expires_in || 2592000;
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
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();

    if (appId.includes("mock") || appSecret.includes("mock")) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
      return {
        accessToken: `pin_refreshed_token_${Date.now()}`,
        refreshToken,
        expiresIn: 30 * 24 * 3600,
        expiresAt,
        scopes: this.scopes,
      };
    }

    const tokenUrl = "https://api.pinterest.com/v5/oauth/token";
    const basicAuth = Buffer.from(`${appId}:${appSecret}`).toString("base64");

    const bodyParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    const data = await res.json();
    if (!res.ok || data.message) {
      throw new Error(`Pinterest token refresh failed: ${data.message}`);
    }

    const expiresIn = data.expires_in || 2592000;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      scopes: this.scopes,
    };
  }

  public async getAccountProfile(accessToken: string): Promise<SocialAccountProfile> {
    if (accessToken.includes("mock")) {
      return {
        id: "pin_user_991203",
        name: "Acme Moodboards",
        handle: "acmemoodboards",
        accountType: "profile",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      };
    }

    const userUrl = "https://api.pinterest.com/v5/user_account";
    const res = await fetch(userUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json();
    if (!res.ok || data.message) {
      throw new Error(`Failed to fetch Pinterest profile: ${data.message || "Unknown error"}`);
    }

    return {
      id: data.username || data.id,
      name: data.business_name || data.username,
      handle: `@${data.username}`,
      avatarUrl: data.profile_image || undefined,
      accountType: data.account_type === "BUSINESS" ? "business" : "profile",
    };
  }

  public getPublishingCapabilities(): PlatformCapabilities {
    return {
      supportsText: true,
      supportsImages: true,
      supportsVideo: true,
      supportsCarousels: false,
      supportsReelsOrShorts: false,
      maxTextLength: 500, // Description limit
      maxImages: 1,
      maxVideoDurationSeconds: 900,
      requiresMediaForPost: true, // Pinterest requires Pin media
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
        error: "Pinterest Pin publishing requires an image or video attachment.",
      };
    }

    if (accessToken.includes("mock")) {
      const mockPinId = `pin_${Date.now()}`;
      return {
        success: true,
        postId: mockPinId,
        platformPostUrl: `https://www.pinterest.com/pin/${mockPinId}/`,
        status: "PUBLISHED",
      };
    }

    try {
      const firstMedia = post.media[0];
      const pinUrl = "https://api.pinterest.com/v5/pins";
      const boardId = post.settings?.boardId || "default_board_id";

      const pinPayload = {
        title: post.content.split("\n")[0].substring(0, 100) || "Saucer Pin",
        description: post.content,
        board_id: boardId,
        media_source: {
          source_type: "image_url",
          url: firstMedia.url,
        },
      };

      const res = await fetch(pinUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pinPayload),
      });

      const data = await res.json();
      if (!res.ok || data.message) {
        return {
          success: false,
          status: "FAILED",
          error: data.message || "Pinterest Pin publishing failed.",
          errorCode: data.code?.toString(),
        };
      }

      const pinId = data.id;
      return {
        success: true,
        postId: pinId,
        platformPostUrl: `https://www.pinterest.com/pin/${pinId}/`,
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
