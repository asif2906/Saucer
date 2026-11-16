import { prisma } from "@/lib/prisma";

export interface CreateNotificationParams {
  organizationId: string;
  workspaceId: string;
  type: "PUBLISH_SUCCESS" | "PUBLISH_FAILED" | "TOKEN_EXPIRED" | "RECONNECT_REQUIRED" | "RETRY_OUTCOME";
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Create an in-app customer notification with strict event deduplication.
   * If an identical event notification was created within the last 10 minutes,
   * it prevents spamming the customer.
   */
  public static async notify(params: CreateNotificationParams) {
    try {
      const dedupeKey = params.metadata?.dedupeKey || params.metadata?.jobId || params.metadata?.variantId;

      if (dedupeKey) {
        // Check for recent duplicate notification with the same dedupe key
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const existing = await prisma.notification.findFirst({
          where: {
            workspaceId: params.workspaceId,
            type: params.type,
            createdAt: { gte: tenMinutesAgo },
          },
        });

        if (existing && (existing.metadata as any)?.dedupeKey === dedupeKey) {
          // Duplicate event detected, skip
          return existing;
        }
      }

      return await prisma.notification.create({
        data: {
          organizationId: params.organizationId,
          workspaceId: params.workspaceId,
          type: params.type,
          title: params.title,
          message: params.message,
          read: false,
          metadata: params.metadata || {},
        },
      });
    } catch (err: any) {
      console.error("[NotificationService] Failed to create notification:", err.message);
      return null;
    }
  }

  public static async listNotifications(workspaceId: string, limit = 50) {
    return prisma.notification.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  public static async markAsRead(notificationId: string, workspaceId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, workspaceId },
      data: { read: true },
    });
  }
}
