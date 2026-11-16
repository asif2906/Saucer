import { prisma } from "@/lib/prisma";

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  retryAfterSeconds?: number;
  currentRpm?: number;
  currentRpd?: number;
}

export class GlobalQuotaController {
  private static getMaxRpm(): number {
    return parseInt(process.env.GEMINI_MAX_RPM || "15", 10);
  }

  private static getMaxTpm(): number {
    return parseInt(process.env.GEMINI_MAX_TPM || "1000000", 10);
  }

  private static getMaxRpd(): number {
    return parseInt(process.env.GEMINI_MAX_RPD || "1500", 10);
  }

  private static getMaxConcurrent(): number {
    return parseInt(process.env.GEMINI_MAX_CONCURRENT || "5", 10);
  }

  private static isKillSwitchActive(): boolean {
    return process.env.AI_ADMIN_KILL_SWITCH === "true";
  }

  /**
   * Calculates whether the current time has crossed midnight US Pacific Time (UTC-8)
   * since the last recorded daily reset timestamp.
   */
  private static isNewPacificDay(lastReset: Date, now: Date): boolean {
    // Pacific Standard Time is UTC-8 (or PDT UTC-7). We use UTC-8 as canonical baseline.
    const pacificOffsetMs = -8 * 60 * 60 * 1000;
    const lastResetPacific = new Date(lastReset.getTime() + pacificOffsetMs);
    const nowPacific = new Date(now.getTime() + pacificOffsetMs);

    return (
      nowPacific.getUTCFullYear() > lastResetPacific.getUTCFullYear() ||
      nowPacific.getUTCMonth() > lastResetPacific.getUTCMonth() ||
      nowPacific.getUTCDate() > lastResetPacific.getUTCDate()
    );
  }

  /**
   * Atomically checks and reserves shared Google API quota using PostgreSQL transactions.
   */
  public static async reserveQuota(estimatedTokens: number = 500): Promise<QuotaCheckResult> {
    if (this.isKillSwitchActive()) {
      return {
        allowed: false,
        reason: "Administrative AI availability switch is active. AI operations are temporarily suspended.",
      };
    }

    const maxRpm = this.getMaxRpm();
    const maxTpm = this.getMaxTpm();
    const maxRpd = this.getMaxRpd();
    const maxConcurrent = this.getMaxConcurrent();

    return await prisma.$transaction(async (tx) => {
      // Fetch and lock the singleton global quota row
      const quota = await tx.aiGlobalQuota.upsert({
        where: { id: "global" },
        update: {},
        create: {
          id: "global",
          requestsThisMinute: 0,
          tokensThisMinute: 0,
          requestsToday: 0,
          activeConcurrentRequests: 0,
          killSwitchActive: false,
        },
      });

      if (quota.killSwitchActive) {
        return {
          allowed: false,
          reason: "Global administrative AI kill-switch is active.",
        };
      }

      const now = new Date();
      let requestsThisMinute = quota.requestsThisMinute;
      let tokensThisMinute = quota.tokensThisMinute;
      let requestsToday = quota.requestsToday;
      let lastResetMinute = quota.lastResetMinute;
      let lastResetDay = quota.lastResetDay;

      // 1. Check minute window reset (60 seconds)
      const secondsSinceMinuteReset = (now.getTime() - lastResetMinute.getTime()) / 1000;
      if (secondsSinceMinuteReset >= 60) {
        requestsThisMinute = 0;
        tokensThisMinute = 0;
        lastResetMinute = now;
      }

      // 2. Check daily window reset (Midnight Pacific Time)
      if (this.isNewPacificDay(lastResetDay, now)) {
        requestsToday = 0;
        lastResetDay = now;
      }

      // 3. Concurrency check
      if (quota.activeConcurrentRequests >= maxConcurrent) {
        return {
          allowed: false,
          reason: `Global concurrency limit reached (${quota.activeConcurrentRequests}/${maxConcurrent} active). Please try again in a few seconds.`,
          retryAfterSeconds: 3,
        };
      }

      // 4. Rate per minute check
      if (requestsThisMinute + 1 > maxRpm) {
        const waitSeconds = Math.max(1, Math.ceil(60 - secondsSinceMinuteReset));
        return {
          allowed: false,
          reason: `Google Free-Tier rate limit reached (${requestsThisMinute}/${maxRpm} RPM). Quota resets in ${waitSeconds}s.`,
          retryAfterSeconds: waitSeconds,
          currentRpm: requestsThisMinute,
        };
      }

      // 5. Tokens per minute check
      if (tokensThisMinute + estimatedTokens > maxTpm) {
        const waitSeconds = Math.max(1, Math.ceil(60 - secondsSinceMinuteReset));
        return {
          allowed: false,
          reason: `Google Free-Tier token rate limit reached (${tokensThisMinute}/${maxTpm} TPM). Quota resets in ${waitSeconds}s.`,
          retryAfterSeconds: waitSeconds,
        };
      }

      // 6. Requests per day check
      if (requestsToday + 1 > maxRpd) {
        return {
          allowed: false,
          reason: `Daily free API quota exhausted (${requestsToday}/${maxRpd} RPD). Daily reset occurs at midnight Pacific Time.`,
          retryAfterSeconds: 3600,
          currentRpd: requestsToday,
        };
      }

      // 7. Atomic reservation granted: update counters
      await tx.aiGlobalQuota.update({
        where: { id: "global" },
        data: {
          requestsThisMinute: requestsThisMinute + 1,
          tokensThisMinute: tokensThisMinute + estimatedTokens,
          requestsToday: requestsToday + 1,
          activeConcurrentRequests: { increment: 1 },
          lastResetMinute,
          lastResetDay,
        },
      });

      return {
        allowed: true,
        currentRpm: requestsThisMinute + 1,
        currentRpd: requestsToday + 1,
      };
    });
  }

  /**
   * Releases concurrent request slot and reconciles actual token usage.
   */
  public static async releaseQuota(actualTokens?: number, estimatedTokens: number = 500): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        const quota = await tx.aiGlobalQuota.findUnique({
          where: { id: "global" },
        });
        if (!quota) return;

        const newConcurrent = Math.max(0, quota.activeConcurrentRequests - 1);
        let tokenAdjustment = 0;
        if (actualTokens !== undefined) {
          tokenAdjustment = actualTokens - estimatedTokens;
        }

        await tx.aiGlobalQuota.update({
          where: { id: "global" },
          data: {
            activeConcurrentRequests: newConcurrent,
            tokensThisMinute: Math.max(0, quota.tokensThisMinute + tokenAdjustment),
          },
        });
      });
    } catch (err) {
      console.error("[GlobalQuotaController] Failed to release quota slot:", err);
    }
  }

  /**
   * Retrieves current real-time quota metrics across all instances.
   */
  public static async getQuotaStatus() {
    const quota = await prisma.aiGlobalQuota.findUnique({
      where: { id: "global" },
    });

    const maxRpm = this.getMaxRpm();
    const maxTpm = this.getMaxTpm();
    const maxRpd = this.getMaxRpd();
    const maxConcurrent = this.getMaxConcurrent();

    return {
      activeConcurrent: quota?.activeConcurrentRequests ?? 0,
      maxConcurrent,
      requestsThisMinute: quota?.requestsThisMinute ?? 0,
      maxRpm,
      tokensThisMinute: quota?.tokensThisMinute ?? 0,
      maxTpm,
      requestsToday: quota?.requestsToday ?? 0,
      maxRpd,
      killSwitchActive: quota?.killSwitchActive ?? false,
      lastResetMinute: quota?.lastResetMinute ?? new Date(),
      lastResetDay: quota?.lastResetDay ?? new Date(),
    };
  }
}
