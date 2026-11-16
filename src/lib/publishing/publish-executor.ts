import { prisma } from "@/lib/prisma";
import { ProviderRegistry } from "@/lib/social/provider-registry";
import { decryptToken, encryptToken } from "@/lib/security/encryption";
import { NotificationService } from "@/lib/notifications/notification.service";
import {
  PostStatus,
  PublishJobStatus,
  AttemptOutcome,
  ConnectionStatus,
  SocialProvider,
} from "@prisma/client";

export interface ExecutionResult {
  success: boolean;
  jobId: string;
  variantId: string;
  platform: SocialProvider;
  externalPostId?: string;
  outcome: AttemptOutcome;
  error?: string;
  nextRetryAt?: Date | null;
}

export class PublishExecutor {
  /**
   * Execute a single publish job for a post variant with full reliability,
   * idempotency, token refresh, and aggregate state updates.
   */
  public static async executeJob(jobId: string): Promise<ExecutionResult> {
    const startedAt = new Date();

    // 1. Fetch Job, Variant, Post, and SocialAccount
    const job = await prisma.publishJob.findUnique({
      where: { id: jobId },
      include: {
        postVariant: {
          include: {
            post: true,
            socialAccount: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error(`PublishJob with id ${jobId} not found.`);
    }

    const variant = job.postVariant;
    const post = variant.post;
    const account = variant.socialAccount;

    // Stale check: If post was cancelled or updated after job was scheduled
    if (post.status === PostStatus.CANCELLED) {
      await prisma.publishJob.update({
        where: { id: jobId },
        data: { status: PublishJobStatus.CANCELLED, completedAt: new Date() },
      });
      await prisma.postVariant.update({
        where: { id: variant.id },
        data: { status: PostStatus.CANCELLED },
      });
      return {
        success: false,
        jobId,
        variantId: variant.id,
        platform: variant.platform,
        outcome: AttemptOutcome.PERMANENT_FAILURE,
        error: "Post was cancelled prior to execution.",
      };
    }

    // Idempotency check: Already published
    if (variant.status === PostStatus.PUBLISHED && variant.externalPostId) {
      await prisma.publishJob.update({
        where: { id: jobId },
        data: { status: PublishJobStatus.COMPLETED, completedAt: new Date() },
      });
      return {
        success: true,
        jobId,
        variantId: variant.id,
        platform: variant.platform,
        externalPostId: variant.externalPostId,
        outcome: AttemptOutcome.SUCCESS,
      };
    }

    // Mark job and variant as RUNNING / PUBLISHING
    await prisma.publishJob.update({
      where: { id: jobId },
      data: {
        status: PublishJobStatus.RUNNING,
        attemptCount: { increment: 1 },
      },
    });

    await prisma.postVariant.update({
      where: { id: variant.id },
      data: { status: PostStatus.PUBLISHING },
    });

    await prisma.post.update({
      where: { id: post.id },
      data: { status: PostStatus.PUBLISHING },
    });

    const currentAttemptNumber = job.attemptCount + 1;

    // 2. Authorization check
    if (account.workspaceId !== post.workspaceId || account.organizationId !== post.organizationId) {
      const err = "Unauthorized: Social account does not belong to the target workspace or organization.";
      await this.recordFailure(job, variant, post, currentAttemptNumber, startedAt, AttemptOutcome.PERMANENT_FAILURE, "UNAUTHORIZED", err);
      return {
        success: false,
        jobId,
        variantId: variant.id,
        platform: variant.platform,
        outcome: AttemptOutcome.PERMANENT_FAILURE,
        error: err,
      };
    }

    // 3. Connection status check
    if (account.connectionStatus !== ConnectionStatus.CONNECTED) {
      const err = `Social account connection status is ${account.connectionStatus}. Reconnection required.`;
      await this.recordFailure(job, variant, post, currentAttemptNumber, startedAt, AttemptOutcome.PERMANENT_FAILURE, "DISCONNECTED", err);
      await NotificationService.notify({
        organizationId: post.organizationId,
        workspaceId: post.workspaceId,
        type: "RECONNECT_REQUIRED",
        title: `Reconnection Required: ${account.accountName}`,
        message: `Your ${variant.platform} account (${account.accountName}) is ${account.connectionStatus.toLowerCase()}. Please reconnect to resume publishing.`,
        metadata: { socialAccountId: account.id, platform: variant.platform, dedupeKey: `reconnect_${account.id}` },
      });
      return {
        success: false,
        jobId,
        variantId: variant.id,
        platform: variant.platform,
        outcome: AttemptOutcome.PERMANENT_FAILURE,
        error: err,
      };
    }

    // 4. Token decryption and expiration check
    let accessToken = "";
    try {
      accessToken = decryptToken(account.encryptedAccessToken);
    } catch (decryptErr: any) {
      const err = `Failed to decrypt OAuth access token: ${decryptErr.message}`;
      await this.recordFailure(job, variant, post, currentAttemptNumber, startedAt, AttemptOutcome.PERMANENT_FAILURE, "DECRYPTION_ERROR", err);
      return {
        success: false,
        jobId,
        variantId: variant.id,
        platform: variant.platform,
        outcome: AttemptOutcome.PERMANENT_FAILURE,
        error: err,
      };
    }

    let providerInstance;
    try {
      providerInstance = ProviderRegistry.get(variant.platform);
    } catch {
      const err = `Unsupported social provider: ${variant.platform}`;
      await this.recordFailure(job, variant, post, currentAttemptNumber, startedAt, AttemptOutcome.PERMANENT_FAILURE, "UNSUPPORTED_PROVIDER", err);
      return {
        success: false,
        jobId,
        variantId: variant.id,
        platform: variant.platform,
        outcome: AttemptOutcome.PERMANENT_FAILURE,
        error: err,
      };
    }

    // Token refresh if expired
    const isTokenExpired = account.tokenExpiresAt && account.tokenExpiresAt.getTime() <= Date.now() + 60 * 1000;
    if (isTokenExpired && account.encryptedRefreshToken && providerInstance.refreshAccessToken) {
      try {
        const refreshToken = decryptToken(account.encryptedRefreshToken);
        const refreshed = await providerInstance.refreshAccessToken(refreshToken);
        accessToken = refreshed.accessToken;

        await prisma.socialAccount.update({
          where: { id: account.id },
          data: {
            encryptedAccessToken: encryptToken(refreshed.accessToken),
            encryptedRefreshToken: refreshed.refreshToken ? encryptToken(refreshed.refreshToken) : account.encryptedRefreshToken,
            tokenExpiresAt: refreshed.expiresAt,
            lastRefreshedAt: new Date(),
          },
        });
      } catch (refreshErr: any) {
        console.warn(`[PublishExecutor] Token refresh failed for account ${account.id}: ${refreshErr.message}`);
        await prisma.socialAccount.update({
          where: { id: account.id },
          data: { connectionStatus: ConnectionStatus.EXPIRED },
        });

        await NotificationService.notify({
          organizationId: post.organizationId,
          workspaceId: post.workspaceId,
          type: "TOKEN_EXPIRED",
          title: `Access Token Expired: ${account.accountName}`,
          message: `The access token for ${account.accountName} on ${variant.platform} has expired and could not be automatically refreshed.`,
          metadata: { socialAccountId: account.id, platform: variant.platform, dedupeKey: `token_expired_${account.id}` },
        });

        const err = `Access token expired and refresh failed: ${refreshErr.message}`;
        await this.recordFailure(job, variant, post, currentAttemptNumber, startedAt, AttemptOutcome.PERMANENT_FAILURE, "TOKEN_EXPIRED", err);
        return {
          success: false,
          jobId,
          variantId: variant.id,
          platform: variant.platform,
          outcome: AttemptOutcome.PERMANENT_FAILURE,
          error: err,
        };
      }
    }

    // 5. Content constraint validation
    const capabilities = providerInstance.getPublishingCapabilities();
    const captionLength = variant.caption.length;
    if (captionLength > capabilities.maxTextLength) {
      const err = `Caption length (${captionLength}) exceeds platform limit of ${capabilities.maxTextLength} characters for ${variant.platform}.`;
      await this.recordFailure(job, variant, post, currentAttemptNumber, startedAt, AttemptOutcome.PERMANENT_FAILURE, "TEXT_LIMIT_EXCEEDED", err);
      return {
        success: false,
        jobId,
        variantId: variant.id,
        platform: variant.platform,
        outcome: AttemptOutcome.PERMANENT_FAILURE,
        error: err,
      };
    }

    const mediaList = (variant.mediaConfig as any) || [];
    if (capabilities.requiresMediaForPost && (!mediaList || mediaList.length === 0)) {
      const err = `${variant.platform} publishing requires at least one image or video attachment.`;
      await this.recordFailure(job, variant, post, currentAttemptNumber, startedAt, AttemptOutcome.PERMANENT_FAILURE, "MEDIA_REQUIRED", err);
      return {
        success: false,
        jobId,
        variantId: variant.id,
        platform: variant.platform,
        outcome: AttemptOutcome.PERMANENT_FAILURE,
        error: err,
      };
    }

    // 6. Execute Provider Publishing
    try {
      const publishResult = await providerInstance.publishPost(
        accessToken,
        account.providerAccountId,
        {
          content: variant.caption,
          media: mediaList,
          settings: (variant.platformMetadata as any) || {},
        }
      );

      if (publishResult.success && publishResult.postId) {
        // SUCCESSFUL PUBLICATION
        const completedAt = new Date();

        await prisma.publishAttempt.create({
          data: {
            jobId: job.id,
            attemptNumber: currentAttemptNumber,
            startedAt,
            completedAt,
            outcome: AttemptOutcome.SUCCESS,
            externalResponseId: publishResult.postId,
          },
        });

        await prisma.postVariant.update({
          where: { id: variant.id },
          data: {
            status: PostStatus.PUBLISHED,
            externalPostId: publishResult.postId,
            publishedAt: completedAt,
            errorMessage: null,
          },
        });

        await prisma.publishJob.update({
          where: { id: job.id },
          data: {
            status: PublishJobStatus.COMPLETED,
            completedAt,
          },
        });

        // Trigger Notification
        await NotificationService.notify({
          organizationId: post.organizationId,
          workspaceId: post.workspaceId,
          type: "PUBLISH_SUCCESS",
          title: `Published to ${variant.platform}`,
          message: `Your post was successfully published to ${account.accountName}.`,
          metadata: {
            postId: post.id,
            variantId: variant.id,
            externalPostId: publishResult.postId,
            dedupeKey: `pub_succ_${variant.id}`,
          },
        });

        // Update Aggregate Post Status
        await this.updateAggregatePostStatus(post.id);

        return {
          success: true,
          jobId,
          variantId: variant.id,
          platform: variant.platform,
          externalPostId: publishResult.postId,
          outcome: AttemptOutcome.SUCCESS,
        };
      }

      // Provider returned unsuccessful response
      const errorCode = publishResult.errorCode || "PROVIDER_REJECTED";
      const errorMsg = publishResult.error || "Provider rejected the publishing request.";

      // Classify transient vs permanent error
      const isTransient = this.isTransientError(errorCode, errorMsg);
      const outcome = isTransient ? AttemptOutcome.TRANSIENT_FAILURE : AttemptOutcome.PERMANENT_FAILURE;

      const nextRetry = await this.recordFailure(
        job,
        variant,
        post,
        currentAttemptNumber,
        startedAt,
        outcome,
        errorCode,
        errorMsg
      );

      return {
        success: false,
        jobId,
        variantId: variant.id,
        platform: variant.platform,
        outcome,
        error: errorMsg,
        nextRetryAt: nextRetry,
      };
    } catch (execErr: any) {
      const errorMsg = execErr.message || "Unexpected publishing execution failure.";
      const isTransient = this.isTransientError("NETWORK_OR_TIMEOUT", errorMsg);
      const outcome = isTransient ? AttemptOutcome.TRANSIENT_FAILURE : AttemptOutcome.PERMANENT_FAILURE;

      const nextRetry = await this.recordFailure(
        job,
        variant,
        post,
        currentAttemptNumber,
        startedAt,
        outcome,
        "UNEXPECTED_ERROR",
        errorMsg
      );

      return {
        success: false,
        jobId,
        variantId: variant.id,
        platform: variant.platform,
        outcome,
        error: errorMsg,
        nextRetryAt: nextRetry,
      };
    }
  }

  /**
   * Record attempt failure, handle exponential backoff or permanent failure,
   * and update aggregate post status.
   */
  private static async recordFailure(
    job: any,
    variant: any,
    post: any,
    attemptNumber: number,
    startedAt: Date,
    outcome: AttemptOutcome,
    providerErrorCode: string,
    safeErrorMessage: string
  ): Promise<Date | null> {
    const completedAt = new Date();

    // Log the attempt
    await prisma.publishAttempt.create({
      data: {
        jobId: job.id,
        attemptNumber,
        startedAt,
        completedAt,
        outcome,
        providerErrorCode,
        safeErrorMessage,
      },
    });

    const isRetryable = outcome === AttemptOutcome.TRANSIENT_FAILURE && attemptNumber < job.maxRetries;

    if (isRetryable) {
      // Exponential backoff: base 60s * 2^(attempt-1), capped at 3600s
      const delaySeconds = Math.min(60 * Math.pow(2, attemptNumber - 1), 3600);
      const nextRetryAt = new Date(Date.now() + delaySeconds * 1000);

      await prisma.publishJob.update({
        where: { id: job.id },
        data: {
          status: PublishJobStatus.PENDING,
          nextRetryAt,
        },
      });

      await prisma.postVariant.update({
        where: { id: variant.id },
        data: {
          status: PostStatus.QUEUED,
          errorMessage: `Temporary failure (${safeErrorMessage}). Retrying at ${nextRetryAt.toISOString()}`,
          retryCount: attemptNumber,
        },
      });

      await this.updateAggregatePostStatus(post.id);
      return nextRetryAt;
    } else {
      // Permanent failure or exhausted retries
      await prisma.publishJob.update({
        where: { id: job.id },
        data: {
          status: PublishJobStatus.FAILED,
          completedAt,
        },
      });

      await prisma.postVariant.update({
        where: { id: variant.id },
        data: {
          status: PostStatus.FAILED,
          errorMessage: safeErrorMessage,
          retryCount: attemptNumber,
        },
      });

      await NotificationService.notify({
        organizationId: post.organizationId,
        workspaceId: post.workspaceId,
        type: "PUBLISH_FAILED",
        title: `Publishing Failed: ${variant.platform}`,
        message: `Failed to publish post to ${variant.platform}: ${safeErrorMessage}`,
        metadata: {
          postId: post.id,
          variantId: variant.id,
          providerErrorCode,
          dedupeKey: `pub_fail_${variant.id}_${attemptNumber}`,
        },
      });

      await this.updateAggregatePostStatus(post.id);
      return null;
    }
  }

  /**
   * Determine whether an error is transient (rate-limit, network timeout, 5xx)
   * or permanent (401 invalid token, bad media format, policy rejection).
   */
  private static isTransientError(errorCode: string, errorMsg: string): boolean {
    const text = (errorCode + " " + errorMsg).toLowerCase();
    if (
      text.includes("rate") ||
      text.includes("429") ||
      text.includes("timeout") ||
      text.includes("econnreset") ||
      text.includes("socket") ||
      text.includes("503") ||
      text.includes("504") ||
      text.includes("quota exceeded temporarily")
    ) {
      return true;
    }
    return false;
  }

  /**
   * Update the overall Post status based on all platform variants:
   * - If all variants are PUBLISHED -> PUBLISHED
   * - If some PUBLISHED and some FAILED -> PARTIALLY_PUBLISHED
   * - If all variants are FAILED -> FAILED
   * - If any variant is PUBLISHING -> PUBLISHING
   * - If any variant is QUEUED/SCHEDULED -> SCHEDULED or QUEUED
   */
  public static async updateAggregatePostStatus(postId: string): Promise<PostStatus> {
    const variants = await prisma.postVariant.findMany({
      where: { postId },
    });

    if (variants.length === 0) return PostStatus.DRAFT;

    const total = variants.length;
    const publishedCount = variants.filter((v) => v.status === PostStatus.PUBLISHED).length;
    const failedCount = variants.filter((v) => v.status === PostStatus.FAILED).length;
    const cancelledCount = variants.filter((v) => v.status === PostStatus.CANCELLED).length;
    const publishingCount = variants.filter((v) => v.status === PostStatus.PUBLISHING).length;
    const queuedCount = variants.filter((v) => v.status === PostStatus.QUEUED).length;

    let aggregateStatus: PostStatus;

    if (publishedCount === total) {
      aggregateStatus = PostStatus.PUBLISHED;
    } else if (publishedCount > 0 && failedCount > 0) {
      aggregateStatus = PostStatus.PARTIALLY_PUBLISHED;
    } else if (failedCount === total) {
      aggregateStatus = PostStatus.FAILED;
    } else if (cancelledCount === total) {
      aggregateStatus = PostStatus.CANCELLED;
    } else if (publishingCount > 0) {
      aggregateStatus = PostStatus.PUBLISHING;
    } else if (queuedCount > 0) {
      aggregateStatus = PostStatus.QUEUED;
    } else {
      aggregateStatus = PostStatus.SCHEDULED;
    }

    await prisma.post.update({
      where: { id: postId },
      data: { status: aggregateStatus },
    });

    return aggregateStatus;
  }
}
