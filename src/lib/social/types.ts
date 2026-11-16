import { SocialProvider } from "@prisma/client";

export interface PlatformCapabilities {
  supportsText: boolean;
  supportsImages: boolean;
  supportsVideo: boolean;
  supportsCarousels: boolean;
  supportsReelsOrShorts: boolean;
  maxTextLength: number;
  maxImages: number;
  maxVideoDurationSeconds: number;
  requiresMediaForPost: boolean;
}

export interface OAuthTokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; // seconds
  expiresAt?: Date;
  scopes: string[];
  providerAccountId?: string;
  tokenType?: string;
}

export interface SocialAccountProfile {
  id: string; // Platform specific account ID
  name: string;
  handle?: string;
  avatarUrl?: string;
  accountType: "business" | "creator" | "page" | "profile" | "channel";
  metadata?: Record<string, any>;
}

export interface PublishMediaItem {
  url: string;
  mediaType: "image" | "video";
  altText?: string;
  thumbnailUrl?: string;
}

export interface PublishPostPayload {
  content: string;
  media?: PublishMediaItem[];
  scheduledDate?: Date;
  settings?: Record<string, any>; // format-specific options (e.g. reel, carousel, shareToFeed)
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  platformPostUrl?: string;
  status: "PUBLISHED" | "PENDING_PROCESSING" | "FAILED";
  error?: string;
  errorCode?: string;
}

export interface PublishStatusResult {
  status: "PUBLISHED" | "IN_PROGRESS" | "FAILED" | "EXPIRED";
  error?: string;
  platformPostId?: string;
}

export interface ISocialProvider {
  readonly provider: SocialProvider;
  readonly displayName: string;
  readonly scopes: string[];

  getAuthorizationUrl(params: {
    state: string;
    redirectUri: string;
    codeVerifier?: string;
  }): string;

  exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
    codeVerifier?: string;
  }): Promise<OAuthTokenResult>;

  refreshAccessToken?(refreshToken: string): Promise<OAuthTokenResult>;

  getAccountProfile(accessToken: string): Promise<SocialAccountProfile>;

  getPublishingCapabilities(): PlatformCapabilities;

  publishPost(
    accessToken: string,
    accountId: string,
    post: PublishPostPayload
  ): Promise<PublishResult>;

  checkPostStatus?(
    accessToken: string,
    publishJobId: string
  ): Promise<PublishStatusResult>;

  deletePost?(
    accessToken: string,
    postId: string
  ): Promise<boolean>;
}
