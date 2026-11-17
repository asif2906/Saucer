import {
  ISocialProvider,
  PlatformCapabilities,
  OAuthTokenResult,
  SocialAccountProfile,
  PublishPostPayload,
  PublishResult,
} from "../types";
import { SocialProvider } from "@prisma/client";

export class LinkedInProvider implements ISocialProvider {
  public readonly provider = SocialProvider.LINKEDIN;
  public readonly displayName = "LinkedIn Profile & Pages";
  public readonly scopes = [
    "openid",
    "profile",
    "email",
    "w_member_social",
  ];

  private getClientId(): string {
    const id = process.env.LINKEDIN_CLIENT_ID;
    if (!id || id.includes("mock")) {
      throw new Error("LinkedIn integration requires LINKEDIN_CLIENT_ID to be configured in your environment variables.");
    }
    return id;
  }

  private getClientSecret(): string {
    const secret = process.env.LINKEDIN_CLIENT_SECRET;
    if (!secret || secret.includes("mock")) {
      throw new Error("LinkedIn integration requires LINKEDIN_CLIENT_SECRET to be configured in your environment variables.");
    }
    return secret;
  }

  public getApiVersion(): string {
    return process.env.LINKEDIN_API_VERSION || "202610";
  }

  public getAuthorizationUrl(params: {
    state: string;
    redirectUri: string;
  }): string {
    const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", this.getClientId());
    url.searchParams.set("redirect_uri", params.redirectUri);
    url.searchParams.set("state", params.state);
    url.searchParams.set("scope", this.scopes.join(" "));
    return url.toString();
  }

  public async exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
  }): Promise<OAuthTokenResult> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const bodyParams = new URLSearchParams({
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: params.redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams.toString(),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(`LinkedIn token exchange failed: ${data.error_description || data.error || "Unknown error"}`);
    }

    const expiresIn = data.expires_in || 5184000;
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

    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const bodyParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams.toString(),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(`LinkedIn token refresh failed: ${data.error_description || data.error}`);
    }

    const expiresIn = data.expires_in || 5184000;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      scopes: this.scopes,
    };
  }

  public async getAccountProfile(accessToken: string): Promise<SocialAccountProfile> {
    // Call OpenID userinfo endpoint
    const userinfoUrl = "https://api.linkedin.com/v2/userinfo";
    const res = await fetch(userinfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(`Failed to fetch LinkedIn profile: ${data.message || data.error || "Unknown error"}`);
    }

    return {
      id: data.sub, // OpenID subject identifier
      name: data.name || `${data.given_name || ""} ${data.family_name || ""}`.trim(),
      avatarUrl: data.picture || undefined,
      accountType: "profile",
      metadata: { email: data.email },
    };
  }

  public getPublishingCapabilities(): PlatformCapabilities {
    return {
      supportsText: true,
      supportsImages: true,
      supportsVideo: true,
      supportsCarousels: false,
      supportsReelsOrShorts: false,
      maxTextLength: 3000,
      maxImages: 9,
      maxVideoDurationSeconds: 600, // 10 mins
      requiresMediaForPost: false,
    };
  }

  public async publishPost(
    accessToken: string,
    accountId: string,
    post: PublishPostPayload
  ): Promise<PublishResult> {
    if (accessToken.includes("mock")) {
      const mockPostId = `urn:li:share:test_${Date.now()}`;
      return {
        success: true,
        postId: mockPostId,
        platformPostUrl: `https://www.linkedin.com/feed/update/${mockPostId}/`,
        status: "PUBLISHED",
      };
    }

    try {
      // Modern LinkedIn REST Posts API
      const authorUrn = accountId.startsWith("urn:li:") ? accountId : `urn:li:person:${accountId}`;
      const postsUrl = "https://api.linkedin.com/rest/posts";

      const requestBody: Record<string, any> = {
        author: authorUrn,
        commentary: post.content,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      };

      const res = await fetch(postsUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": this.getApiVersion(),
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          status: "FAILED",
          error: errorData.message || `LinkedIn API error (HTTP ${res.status})`,
        };
      }

      // LinkedIn returns the post URN in the x-restli-id header
      const postUrn = res.headers.get("x-restli-id") || `urn:li:share:${Date.now()}`;
      return {
        success: true,
        postId: postUrn,
        platformPostUrl: `https://www.linkedin.com/feed/update/${postUrn}/`,
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
