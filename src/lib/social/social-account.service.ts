import { prisma } from "@/lib/prisma";
import { SocialProvider, ConnectionStatus } from "@prisma/client";
import { ProviderRegistry } from "./provider-registry";
import { encryptToken, decryptToken } from "@/lib/security/encryption";
import { PublishPostPayload, PublishResult, PlatformCapabilities } from "./types";
import { BillingService } from "@/lib/billing/billing.service";
import crypto from "crypto";

export interface SanitizedSocialAccount {
  id: string;
  provider: SocialProvider;
  accountName: string;
  accountHandle?: string | null;
  accountType: string;
  avatarUrl?: string | null;
  connectionStatus: ConnectionStatus;
  tokenExpiresAt?: Date | null;
  lastRefreshedAt?: Date | null;
  isTokenExpired: boolean;
  capabilities: PlatformCapabilities;
}

export class SocialAccountService {
  /**
   * Retrieves sanitized connected social accounts for a workspace.
   * Access tokens and refresh tokens are strictly omitted.
   */
  public static async getAccounts(workspaceId: string): Promise<SanitizedSocialAccount[]> {
    const accounts = await prisma.socialAccount.findMany({
      where: {
        workspaceId,
        connectionStatus: { not: ConnectionStatus.DISCONNECTED },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();

    return accounts.map((acc) => {
      const providerInstance = ProviderRegistry.get(acc.provider);
      const isExpired = acc.tokenExpiresAt ? acc.tokenExpiresAt < now : false;

      return {
        id: acc.id,
        provider: acc.provider,
        accountName: acc.accountName,
        accountHandle: acc.accountHandle,
        accountType: acc.accountType,
        avatarUrl: acc.avatarUrl,
        connectionStatus: isExpired ? ConnectionStatus.EXPIRED : acc.connectionStatus,
        tokenExpiresAt: acc.tokenExpiresAt,
        lastRefreshedAt: acc.lastRefreshedAt,
        isTokenExpired: isExpired,
        capabilities: providerInstance.getPublishingCapabilities(),
      };
    });
  }

  /**
   * Initiates the OAuth authorization handshake with state generation and PKCE code verifier.
   */
  public static async initiateOAuth(params: {
    organizationId: string;
    workspaceId: string;
    userId: string;
    provider: SocialProvider;
    redirectUri: string;
    returnUrl?: string;
  }): Promise<{ authUrl: string; state: string }> {
    const { organizationId, workspaceId, userId, provider, redirectUri, returnUrl } = params;

    // 1. Channel entitlement check
    const billing = await BillingService.getBillingOverview(organizationId);
    const channelLimit = billing.plan.connectedChannels;

    if (channelLimit !== -1) {
      const activeCount = await prisma.socialAccount.count({
        where: {
          organizationId,
          connectionStatus: ConnectionStatus.CONNECTED,
        },
      });

      if (activeCount >= channelLimit) {
        throw new Error(
          `Connected channel limit reached (${activeCount}/${channelLimit}) for the ${billing.plan.displayName} plan. Please upgrade your plan in Billing Settings to connect more channels.`
        );
      }
    }

    // 2. Generate cryptographically random state & PKCE code verifier
    const state = crypto.randomBytes(32).toString("hex");
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes TTL

    // 3. Persist OAuth state
    await prisma.oAuthState.create({
      data: {
        state,
        organizationId,
        workspaceId,
        userId,
        provider,
        codeVerifier,
        returnUrl,
        expiresAt,
      },
    });

    // 4. Construct platform authorization URL
    const providerInstance = ProviderRegistry.get(provider);
    const authUrl = providerInstance.getAuthorizationUrl({
      state,
      redirectUri,
      codeVerifier,
    });

    return { authUrl, state };
  }

  /**
   * Handles the OAuth callback, validates state, exchanges tokens, encrypts at rest, and stores account.
   */
  public static async handleOAuthCallback(params: {
    provider: SocialProvider;
    code: string;
    state: string;
    redirectUri: string;
  }): Promise<{ success: boolean; accountId?: string; returnUrl?: string; error?: string }> {
    const { provider, code, state, redirectUri } = params;

    // 1. State Validation
    const stateRecord = await prisma.oAuthState.findUnique({
      where: { state },
    });

    if (!stateRecord) {
      return { success: false, error: "Invalid OAuth state parameter or request has timed out." };
    }

    if (stateRecord.expiresAt < new Date()) {
      await prisma.oAuthState.delete({ where: { id: stateRecord.id } });
      return { success: false, error: "OAuth authorization session expired. Please retry." };
    }

    const { organizationId, workspaceId, codeVerifier, returnUrl } = stateRecord;

    // Delete used state record immediately to prevent replay
    await prisma.oAuthState.delete({ where: { id: stateRecord.id } });

    // 2. Exchange authorization code for access & refresh tokens
    const providerInstance = ProviderRegistry.get(provider);
    let tokens;
    try {
      tokens = await providerInstance.exchangeCodeForTokens({
        code,
        redirectUri,
        codeVerifier: codeVerifier || undefined,
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }

    // 3. Retrieve account profile from the platform
    let profile;
    try {
      profile = await providerInstance.getAccountProfile(tokens.accessToken);
    } catch (err: any) {
      return { success: false, error: err.message };
    }

    // 4. Encrypt sensitive tokens at rest using AES-256-GCM
    const encryptedAccessToken = encryptToken(tokens.accessToken);
    const encryptedRefreshToken = tokens.refreshToken ? encryptToken(tokens.refreshToken) : null;

    // 5. Upsert social account into database
    const account = await prisma.socialAccount.upsert({
      where: {
        workspaceId_provider_providerAccountId: {
          workspaceId,
          provider,
          providerAccountId: profile.id,
        },
      },
      create: {
        organizationId,
        workspaceId,
        provider,
        providerAccountId: profile.id,
        accountName: profile.name,
        accountHandle: profile.handle,
        accountType: profile.accountType,
        avatarUrl: profile.avatarUrl,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt: tokens.expiresAt,
        grantedScopes: tokens.scopes,
        connectionStatus: ConnectionStatus.CONNECTED,
        lastRefreshedAt: new Date(),
        metadata: profile.metadata || {},
      },
      update: {
        accountName: profile.name,
        accountHandle: profile.handle,
        accountType: profile.accountType,
        avatarUrl: profile.avatarUrl,
        encryptedAccessToken,
        encryptedRefreshToken: encryptedRefreshToken || undefined,
        tokenExpiresAt: tokens.expiresAt,
        grantedScopes: tokens.scopes,
        connectionStatus: ConnectionStatus.CONNECTED,
        lastRefreshedAt: new Date(),
        metadata: profile.metadata || {},
      },
    });

    return {
      success: true,
      accountId: account.id,
      returnUrl: returnUrl || "/app/social-accounts",
    };
  }

  /**
   * Disconnects an account from a workspace.
   */
  public static async disconnectAccount(
    workspaceId: string,
    accountId: string
  ): Promise<{ success: boolean; error?: string }> {
    const account = await prisma.socialAccount.findFirst({
      where: { id: accountId, workspaceId },
    });

    if (!account) {
      return { success: false, error: "Account not found or access denied." };
    }

    await prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        connectionStatus: ConnectionStatus.DISCONNECTED,
        encryptedAccessToken: "",
        encryptedRefreshToken: null,
      },
    });

    return { success: true };
  }

  /**
   * Refreshes OAuth token for an account and persists encrypted credentials.
   */
  public static async refreshAccountToken(
    accountId: string
  ): Promise<{ success: boolean; error?: string }> {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return { success: false, error: "Account not found." };
    }

    const providerInstance = ProviderRegistry.get(account.provider);
    if (!providerInstance.refreshAccessToken) {
      return { success: false, error: `Provider ${account.provider} does not support token refresh.` };
    }

    try {
      const tokenToRefresh = account.encryptedRefreshToken
        ? decryptToken(account.encryptedRefreshToken)
        : decryptToken(account.encryptedAccessToken);

      const refreshed = await providerInstance.refreshAccessToken(tokenToRefresh);

      const encryptedAccessToken = encryptToken(refreshed.accessToken);
      const encryptedRefreshToken = refreshed.refreshToken
        ? encryptToken(refreshed.refreshToken)
        : account.encryptedRefreshToken;

      await prisma.socialAccount.update({
        where: { id: accountId },
        data: {
          encryptedAccessToken,
          encryptedRefreshToken,
          tokenExpiresAt: refreshed.expiresAt,
          connectionStatus: ConnectionStatus.CONNECTED,
          lastRefreshedAt: new Date(),
        },
      });

      return { success: true };
    } catch (err: any) {
      await prisma.socialAccount.update({
        where: { id: accountId },
        data: { connectionStatus: ConnectionStatus.ERROR },
      });
      return { success: false, error: err.message };
    }
  }

  /**
   * Publishes content to a connected social account.
   */
  public static async publishPost(
    workspaceId: string,
    accountId: string,
    post: PublishPostPayload
  ): Promise<PublishResult> {
    const account = await prisma.socialAccount.findFirst({
      where: { id: accountId, workspaceId },
    });

    if (!account) {
      return { success: false, status: "FAILED", error: "Account not found in active workspace." };
    }

    if (account.connectionStatus !== ConnectionStatus.CONNECTED) {
      return {
        success: false,
        status: "FAILED",
        error: `Account connection is in ${account.connectionStatus} state. Please reconnect account.`,
      };
    }

    const providerInstance = ProviderRegistry.get(account.provider);
    const accessToken = decryptToken(account.encryptedAccessToken);

    return await providerInstance.publishPost(accessToken, account.providerAccountId, post);
  }
}
