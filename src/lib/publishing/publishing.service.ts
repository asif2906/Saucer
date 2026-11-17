import { prisma } from "@/lib/prisma";
import { PublishExecutor, ExecutionResult } from "./publish-executor";
import { inngest } from "@/lib/inngest/client";
import {
  PostStatus,
  PostType,
  PublishJobStatus,
  SocialProvider,
} from "@prisma/client";

export interface CreatePostVariantInput {
  socialAccountId: string;
  platform: SocialProvider;
  caption: string;
  mediaConfig?: Array<{
    url: string;
    mediaType: "image" | "video";
    altText?: string;
  }>;
  platformMetadata?: Record<string, any>;
}

export interface CreatePostInput {
  organizationId: string;
  workspaceId: string;
  createdById: string;
  content: string;
  postType?: PostType;
  scheduledAt?: Date | null;
  timezone?: string;
  publishNow?: boolean;
  variants: CreatePostVariantInput[];
}

export interface UpdatePostInput {
  content?: string;
  scheduledAt?: Date | null;
  timezone?: string;
  variants?: Array<{
    id?: string;
    socialAccountId: string;
    platform: SocialProvider;
    caption: string;
    mediaConfig?: any;
    platformMetadata?: any;
  }>;
}

export class PublishingService {
  /**
   * Create a post with multiple platform variants.
   * If publishNow is true, it executes publishing immediately.
   * If scheduledAt is provided, it creates scheduled jobs.
   * Otherwise, saves as a draft.
   */
  public static async createPost(input: CreatePostInput): Promise<{
    post: any;
    executionResults?: ExecutionResult[];
  }> {
    const isImmediate = !!input.publishNow;
    const isScheduled = !isImmediate && !!input.scheduledAt && input.scheduledAt.getTime() > Date.now();
    const initialStatus = isImmediate ? PostStatus.PUBLISHING : isScheduled ? PostStatus.SCHEDULED : PostStatus.DRAFT;

    if ((isImmediate || isScheduled) && (!input.variants || input.variants.length === 0)) {
      throw new Error("At least one social platform variant must be selected for publishing or scheduling.");
    }

    // 1. Create Post & Variants in a database transaction
    const post = await prisma.$transaction(async (tx) => {
      const createdPost = await tx.post.create({
        data: {
          organizationId: input.organizationId,
          workspaceId: input.workspaceId,
          createdById: input.createdById,
          content: input.content,
          postType: input.postType || PostType.STANDARD,
          status: initialStatus,
          scheduledAt: input.scheduledAt || null,
          timezone: input.timezone || "UTC",
        },
      });

      for (const v of input.variants) {
        const variant = await tx.postVariant.create({
          data: {
            postId: createdPost.id,
            socialAccountId: v.socialAccountId,
            platform: v.platform,
            caption: v.caption || input.content,
            mediaConfig: v.mediaConfig || [],
            platformMetadata: v.platformMetadata || {},
            status: initialStatus,
          },
        });

        if (isImmediate || isScheduled) {
          const scheduledTime = isImmediate ? new Date() : input.scheduledAt!;
          const idempotencyKey = `job_${variant.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

          await tx.publishJob.create({
            data: {
              postVariantId: variant.id,
              scheduledAt: scheduledTime,
              status: PublishJobStatus.PENDING,
              idempotencyKey,
            },
          });
        }
      }

      return tx.post.findUniqueOrThrow({
        where: { id: createdPost.id },
        include: {
          variants: {
            include: {
              jobs: true,
              socialAccount: true,
            },
          },
        },
      });
    });

    // 2. Dispatch / Execute
    if (isImmediate) {
      const executionResults: ExecutionResult[] = [];
      for (const variant of post.variants) {
        if (variant.jobs && variant.jobs.length > 0) {
          const job = variant.jobs[0];
          const result = await PublishExecutor.executeJob(job.id);
          executionResults.push(result);
        }
      }

      const refreshedPost = await prisma.post.findUnique({
        where: { id: post.id },
        include: {
          variants: {
            include: {
              jobs: {
                include: { attempts: true },
              },
              socialAccount: true,
            },
          },
        },
      });

      return { post: refreshedPost, executionResults };
    }

    if (isScheduled) {
      // Trigger Inngest workflow for persistent scheduling if event key configured
      try {
        await inngest.send({
          name: "saucer/post.scheduled",
          data: {
            postId: post.id,
            scheduledAt: input.scheduledAt!.toISOString(),
          },
        });
      } catch (err: any) {
        console.warn(`[PublishingService] Inngest dispatch notice: ${err.message}`);
      }
    }

    return { post };
  }

  /**
   * Edit a post: Updates content and preserves idempotency by invalidating
   * or updating pending jobs to ensure stale jobs never publish outdated versions.
   */
  public static async updatePost(
    postId: string,
    workspaceId: string,
    input: UpdatePostInput
  ) {
    const post = await prisma.post.findFirst({
      where: { id: postId, workspaceId },
      include: {
        variants: {
          include: { jobs: true },
        },
      },
    });

    if (!post) {
      throw new Error("Post not found or unauthorized.");
    }

    if (post.status === PostStatus.PUBLISHED) {
      throw new Error("Cannot edit a post that has already been published.");
    }

    return prisma.$transaction(async (tx) => {
      // Update core post
      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: {
          content: input.content ?? post.content,
          scheduledAt: input.scheduledAt !== undefined ? input.scheduledAt : post.scheduledAt,
          timezone: input.timezone ?? post.timezone,
          status: input.scheduledAt ? PostStatus.SCHEDULED : post.status,
          updatedAt: new Date(),
        },
      });

      // Update variants if provided
      if (input.variants) {
        for (const vInput of input.variants) {
          if (vInput.id) {
            await tx.postVariant.update({
              where: { id: vInput.id },
              data: {
                caption: vInput.caption,
                mediaConfig: vInput.mediaConfig,
                platformMetadata: vInput.platformMetadata,
                updatedAt: new Date(),
              },
            });
          }
        }
      }

      // If scheduled time was changed, update pending jobs
      if (input.scheduledAt) {
        for (const variant of post.variants) {
          for (const job of variant.jobs) {
            if (job.status === PublishJobStatus.PENDING) {
              await tx.publishJob.update({
                where: { id: job.id },
                data: {
                  scheduledAt: input.scheduledAt,
                },
              });
            }
          }
        }
      }

      return tx.post.findUnique({
        where: { id: postId },
        include: {
          variants: {
            include: {
              jobs: true,
              socialAccount: true,
            },
          },
        },
      });
    });
  }

  /**
   * Cancel a scheduled post
   */
  public static async cancelPost(postId: string, workspaceId: string) {
    const post = await prisma.post.findFirst({
      where: { id: postId, workspaceId },
      include: {
        variants: {
          include: { jobs: true },
        },
      },
    });

    if (!post) {
      throw new Error("Post not found or unauthorized.");
    }

    if (post.status === PostStatus.PUBLISHED) {
      throw new Error("Cannot cancel a post that has already been published.");
    }

    return prisma.$transaction(async (tx) => {
      // Mark post cancelled
      const cancelledPost = await tx.post.update({
        where: { id: postId },
        data: { status: PostStatus.CANCELLED },
      });

      // Mark variants cancelled
      for (const variant of post.variants) {
        await tx.postVariant.update({
          where: { id: variant.id },
          data: { status: PostStatus.CANCELLED },
        });

        // Mark pending jobs cancelled
        for (const job of variant.jobs) {
          if (job.status === PublishJobStatus.PENDING || job.status === PublishJobStatus.RUNNING) {
            await tx.publishJob.update({
              where: { id: job.id },
              data: { status: PublishJobStatus.CANCELLED, completedAt: new Date() },
            });
          }
        }
      }

      return cancelledPost;
    });
  }

  /**
   * Reschedule post to a new timestamp
   */
  public static async reschedulePost(postId: string, workspaceId: string, newScheduledAt: Date) {
    if (newScheduledAt.getTime() <= Date.now()) {
      throw new Error("Rescheduled date must be in the future.");
    }

    return this.updatePost(postId, workspaceId, {
      scheduledAt: newScheduledAt,
    });
  }

  /**
   * Manually retry a failed publish job
   */
  public static async retryJob(jobId: string, workspaceId: string): Promise<ExecutionResult> {
    const job = await prisma.publishJob.findUnique({
      where: { id: jobId },
      include: {
        postVariant: {
          include: { post: true },
        },
      },
    });

    if (!job || job.postVariant.post.workspaceId !== workspaceId) {
      throw new Error("Job not found or unauthorized.");
    }

    // Reset status to pending and re-execute
    await prisma.publishJob.update({
      where: { id: jobId },
      data: {
        status: PublishJobStatus.PENDING,
        nextRetryAt: null,
      },
    });

    return PublishExecutor.executeJob(jobId);
  }

  /**
   * List posts in publishing queue (SCHEDULED, QUEUED, PUBLISHING)
   */
  public static async listQueue(workspaceId: string) {
    return prisma.post.findMany({
      where: {
        workspaceId,
        status: { in: [PostStatus.SCHEDULED, PostStatus.QUEUED, PostStatus.PUBLISHING] },
      },
      include: {
        variants: {
          include: {
            socialAccount: true,
            jobs: {
              include: { attempts: true },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });
  }

  /**
   * List publishing history (PUBLISHED, PARTIALLY_PUBLISHED, FAILED, CANCELLED)
   */
  public static async listHistory(workspaceId: string, limit = 50) {
    return prisma.post.findMany({
      where: {
        workspaceId,
        status: { in: [PostStatus.PUBLISHED, PostStatus.PARTIALLY_PUBLISHED, PostStatus.FAILED, PostStatus.CANCELLED] },
      },
      include: {
        variants: {
          include: {
            socialAccount: true,
            jobs: {
              include: { attempts: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get posts for visual content calendar with date range filtering
   */
  public static async getCalendarPosts(workspaceId: string, startDate: Date, endDate: Date) {
    return prisma.post.findMany({
      where: {
        workspaceId,
        OR: [
          {
            scheduledAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      include: {
        variants: {
          include: {
            socialAccount: true,
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });
  }

  /**
   * Background Queue Reconciliation:
   * Finds all pending jobs whose scheduledAt <= now(), executes them with concurrency control.
   */
  public static async runDueJobReconciliation(limit = 20): Promise<ExecutionResult[]> {
    const now = new Date();
    const dueJobs = await prisma.publishJob.findMany({
      where: {
        status: PublishJobStatus.PENDING,
        scheduledAt: { lte: now },
        OR: [
          { nextRetryAt: null },
          { nextRetryAt: { lte: now } },
        ],
      },
      take: limit,
    });

    const results: ExecutionResult[] = [];
    for (const job of dueJobs) {
      try {
        const res = await PublishExecutor.executeJob(job.id);
        results.push(res);
      } catch (err: any) {
        console.error(`[PublishingService] Error executing due job ${job.id}:`, err.message);
      }
    }

    return results;
  }
}
