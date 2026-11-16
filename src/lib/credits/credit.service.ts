import { prisma } from "@/lib/prisma";
import { AiOperation, AI_FEATURE_COSTS } from "@/lib/ai/types";
import { ReservationStatus, LedgerEntryType } from "@prisma/client";

export interface ReserveCreditResult {
  success: boolean;
  reservationId?: string;
  error?: string;
  availableCredits?: number;
  cost?: number;
}

export interface SettleCreditResult {
  success: boolean;
  ledgerEntryId?: string;
  error?: string;
  remainingCredits?: number;
}

export class CreditService {
  /**
   * Retrieves or initializes the organization's credit balance.
   */
  public static async getOrCreateBalance(organizationId: string) {
    const existing = await prisma.aiCreditBalance.findUnique({
      where: { organizationId },
    });

    if (existing) {
      return existing;
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return await prisma.aiCreditBalance.create({
      data: {
        organizationId,
        monthlyAllowance: 50,
        monthlyUsed: 0,
        reservedCredits: 0,
        purchasedCredits: 0,
        billingPeriodStart: now,
        billingPeriodEnd: periodEnd,
      },
    });
  }

  /**
   * Calculates total spendable credits for an organization:
   * (monthlyAllowance - monthlyUsed - reservedCredits) + purchasedCredits
   */
  public static getAvailableCredits(balance: {
    monthlyAllowance: number;
    monthlyUsed: number;
    reservedCredits: number;
    purchasedCredits: number;
  }): number {
    const remainingMonthly = Math.max(0, balance.monthlyAllowance - balance.monthlyUsed);
    const unreservedAllowance = Math.max(0, remainingMonthly - balance.reservedCredits);
    // If reserved exceeds monthly, it eats into purchased credits
    const excessReservation = Math.max(0, balance.reservedCredits - remainingMonthly);
    const spendablePurchased = Math.max(0, balance.purchasedCredits - excessReservation);

    return unreservedAllowance + spendablePurchased;
  }

  /**
   * Atomically reserves credits for an AI operation.
   * Uses unique idempotency key to prevent double reservation.
   */
  public static async reserveCredits(
    organizationId: string,
    userId: string,
    operation: AiOperation,
    idempotencyKey: string,
    ttlMinutes: number = 5
  ): Promise<ReserveCreditResult> {
    const cost = AI_FEATURE_COSTS[operation] || 1;

    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Idempotency Check: if reservation already exists with this key, return it
        const existingReservation = await tx.aiCreditReservation.findUnique({
          where: { idempotencyKey },
        });

        if (existingReservation) {
          if (existingReservation.reservationStatus === ReservationStatus.RESERVED) {
            return {
              success: true,
              reservationId: existingReservation.id,
              cost: existingReservation.requestedCredits,
            };
          }
          if (existingReservation.reservationStatus === ReservationStatus.COMMITTED) {
            return {
              success: true,
              reservationId: existingReservation.id,
              cost: existingReservation.requestedCredits,
            };
          }
        }

        // 2. Fetch and lock credit balance
        let balance = await tx.aiCreditBalance.findUnique({
          where: { organizationId },
        });

        if (!balance) {
          const now = new Date();
          balance = await tx.aiCreditBalance.create({
            data: {
              organizationId,
              monthlyAllowance: 50,
              monthlyUsed: 0,
              reservedCredits: 0,
              purchasedCredits: 0,
              billingPeriodStart: now,
              billingPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // 3. Check sufficient available credits
        const available = this.getAvailableCredits(balance);
        if (available < cost) {
          return {
            success: false,
            error: `Insufficient AI credits. Required: ${cost}, Available: ${available}. Please upgrade your plan or purchase an add-on pack.`,
            availableCredits: available,
            cost,
          };
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

        // 4. Create reservation record
        const reservation = await tx.aiCreditReservation.create({
          data: {
            organizationId,
            userId,
            operation,
            requestedCredits: cost,
            reservationStatus: ReservationStatus.RESERVED,
            idempotencyKey,
            createdAt: now,
            expiresAt,
          },
        });

        // 5. Update balance with reserved amount
        await tx.aiCreditBalance.update({
          where: { organizationId },
          data: {
            reservedCredits: { increment: cost },
          },
        });

        // 6. Record double-entry ledger entry for reservation hold
        await tx.aiCreditLedgerEntry.create({
          data: {
            organizationId,
            reservationId: reservation.id,
            entryType: LedgerEntryType.RESERVATION_HOLD,
            debitAccount: "CUSTOMER_AVAILABLE",
            creditAccount: "CUSTOMER_RESERVED",
            amount: cost,
            feature: operation,
            idempotencyKey: `hold-${idempotencyKey}`,
            createdAt: now,
          },
        });

        return {
          success: true,
          reservationId: reservation.id,
          cost,
          availableCredits: available - cost,
        };
      });
    } catch (err: any) {
      console.error("[CreditService.reserveCredits] Transaction failed:", err);
      return {
        success: false,
        error: err.message || "Failed to reserve credits.",
      };
    }
  }

  /**
   * Settles a reservation upon successful AI generation.
   * Atomically debits reserved amount, adds to monthlyUsed or purchased deduction, and commits ledger.
   */
  public static async settleCredits(
    reservationId: string,
    metadata?: {
      model?: string;
      feature?: string;
      inputTokens?: number;
      outputTokens?: number;
    }
  ): Promise<SettleCreditResult> {
    try {
      return await prisma.$transaction(async (tx) => {
        const reservation = await tx.aiCreditReservation.findUnique({
          where: { id: reservationId },
        });

        if (!reservation) {
          return { success: false, error: "Reservation not found." };
        }

        // Idempotency: if already committed, return success
        if (reservation.reservationStatus === ReservationStatus.COMMITTED) {
          return { success: true };
        }

        if (reservation.reservationStatus !== ReservationStatus.RESERVED) {
          return {
            success: false,
            error: `Cannot settle reservation in state: ${reservation.reservationStatus}`,
          };
        }

        const cost = reservation.requestedCredits;
        const balance = await tx.aiCreditBalance.findUnique({
          where: { organizationId: reservation.organizationId },
        });

        if (!balance) {
          return { success: false, error: "Balance record not found." };
        }

        // Determine allocation: monthly allowance first, then purchased credits
        const remainingAllowance = Math.max(0, balance.monthlyAllowance - balance.monthlyUsed);
        let monthlyUsedDelta = 0;
        let purchasedCreditsDelta = 0;

        if (remainingAllowance >= cost) {
          monthlyUsedDelta = cost;
        } else {
          monthlyUsedDelta = remainingAllowance;
          purchasedCreditsDelta = cost - remainingAllowance;
        }

        const now = new Date();

        // 1. Mark reservation as COMMITTED
        await tx.aiCreditReservation.update({
          where: { id: reservationId },
          data: {
            reservationStatus: ReservationStatus.COMMITTED,
            settledAt: now,
          },
        });

        // 2. Adjust balance: release reserved, apply usage
        const updatedBalance = await tx.aiCreditBalance.update({
          where: { organizationId: reservation.organizationId },
          data: {
            reservedCredits: { decrement: cost },
            monthlyUsed: { increment: monthlyUsedDelta },
            purchasedCredits: { decrement: purchasedCreditsDelta },
          },
        });

        // 3. Record double-entry settlement in immutable ledger
        const ledgerEntry = await tx.aiCreditLedgerEntry.create({
          data: {
            organizationId: reservation.organizationId,
            reservationId: reservation.id,
            entryType: LedgerEntryType.SETTLEMENT_DEBIT,
            debitAccount: "CUSTOMER_RESERVED",
            creditAccount: "PLATFORM_REVENUE",
            amount: cost,
            model: metadata?.model,
            feature: metadata?.feature || reservation.operation,
            inputTokens: metadata?.inputTokens,
            outputTokens: metadata?.outputTokens,
            providerCost: 0.0, // Google Gemini free tier
            idempotencyKey: `settle-${reservation.idempotencyKey}`,
            createdAt: now,
          },
        });

        return {
          success: true,
          ledgerEntryId: ledgerEntry.id,
          remainingCredits: this.getAvailableCredits(updatedBalance),
        };
      });
    } catch (err: any) {
      console.error("[CreditService.settleCredits] Settle failed:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Releases reserved credits back to the customer upon generation failure.
   */
  public static async releaseCredits(
    reservationId: string,
    reason: string = "Generation failure refund"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await prisma.$transaction(async (tx) => {
        const reservation = await tx.aiCreditReservation.findUnique({
          where: { id: reservationId },
        });

        if (!reservation) {
          return { success: false, error: "Reservation not found." };
        }

        // Idempotency: if already released or expired, nothing to do
        if (
          reservation.reservationStatus === ReservationStatus.RELEASED ||
          reservation.reservationStatus === ReservationStatus.EXPIRED
        ) {
          return { success: true };
        }

        if (reservation.reservationStatus !== ReservationStatus.RESERVED) {
          return {
            success: false,
            error: `Cannot release reservation in state: ${reservation.reservationStatus}`,
          };
        }

        const cost = reservation.requestedCredits;
        const now = new Date();

        // 1. Mark reservation as RELEASED
        await tx.aiCreditReservation.update({
          where: { id: reservationId },
          data: {
            reservationStatus: ReservationStatus.RELEASED,
          },
        });

        // 2. Release reserved credits on balance
        await tx.aiCreditBalance.update({
          where: { organizationId: reservation.organizationId },
          data: {
            reservedCredits: { decrement: cost },
          },
        });

        // 3. Record refund entry in ledger
        await tx.aiCreditLedgerEntry.create({
          data: {
            organizationId: reservation.organizationId,
            reservationId: reservation.id,
            entryType: LedgerEntryType.REFUND_CREDIT,
            debitAccount: "CUSTOMER_RESERVED",
            creditAccount: "CUSTOMER_AVAILABLE",
            amount: cost,
            feature: reservation.operation,
            providerCost: 0.0,
            idempotencyKey: `refund-${reservation.idempotencyKey}`,
            createdAt: now,
          },
        });

        return { success: true };
      });
    } catch (err: any) {
      console.error("[CreditService.releaseCredits] Release failed:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Scans and reconciles stuck reservations that exceeded expiresAt without settlement.
   */
  public static async reconcileExpiredReservations(): Promise<{ recoveredCount: number }> {
    const now = new Date();
    const expiredReservations = await prisma.aiCreditReservation.findMany({
      where: {
        reservationStatus: ReservationStatus.RESERVED,
        expiresAt: { lt: now },
      },
      take: 50,
    });

    let recoveredCount = 0;
    for (const res of expiredReservations) {
      const result = await this.releaseCredits(res.id, "Automatic expiration reconciliation");
      if (result.success) {
        recoveredCount++;
      }
    }

    return { recoveredCount };
  }

  /**
   * Durably processes monthly subscription billing renewal.
   * Allocates new monthly allowance, resets monthlyUsed, preserves purchasedCredits.
   * Enforces idempotency per billing cycle to prevent duplicate allocations.
   */
  public static async renewMonthlyAllowance(
    organizationId: string,
    allowance: number,
    cycleStartDate: Date,
    cycleEndDate: Date,
    idempotencyKey: string
  ): Promise<{ success: boolean; alreadyAllocated?: boolean; error?: string }> {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Idempotency Check: check if this billing cycle allocation was already executed
        const existingLedger = await tx.aiCreditLedgerEntry.findUnique({
          where: { idempotencyKey },
        });

        if (existingLedger) {
          return { success: true, alreadyAllocated: true };
        }

        // 2. Ensure balance record exists
        let balance = await tx.aiCreditBalance.findUnique({
          where: { organizationId },
        });

        if (!balance) {
          balance = await tx.aiCreditBalance.create({
            data: {
              organizationId,
              monthlyAllowance: allowance,
              monthlyUsed: 0,
              reservedCredits: 0,
              purchasedCredits: 0,
              billingPeriodStart: cycleStartDate,
              billingPeriodEnd: cycleEndDate,
            },
          });
        } else {
          // 3. Reset monthly usage, update allowance and billing period, strictly preserve purchasedCredits
          await tx.aiCreditBalance.update({
            where: { organizationId },
            data: {
              monthlyAllowance: allowance,
              monthlyUsed: 0,
              billingPeriodStart: cycleStartDate,
              billingPeriodEnd: cycleEndDate,
            },
          });
        }

        // 4. Create immutable audit ledger entry
        await tx.aiCreditLedgerEntry.create({
          data: {
            organizationId,
            entryType: LedgerEntryType.MONTHLY_RESET,
            debitAccount: "SYSTEM_ALLOWANCE_POOL",
            creditAccount: "CUSTOMER_MONTHLY_ALLOWANCE",
            amount: allowance,
            feature: "subscription_renewal",
            providerCost: 0.0,
            idempotencyKey,
            createdAt: new Date(),
          },
        });

        return { success: true, alreadyAllocated: false };
      });
    } catch (err: any) {
      console.error("[CreditService.renewMonthlyAllowance] Error:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Grants purchased non-expiring AI credit pack upon verified payment.succeeded.
   */
  public static async grantPurchasedCredits(
    organizationId: string,
    amount: number,
    providerCostUsd: number,
    idempotencyKey: string
  ): Promise<{ success: boolean; alreadyGranted?: boolean; error?: string }> {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Idempotency Check
        const existing = await tx.aiCreditLedgerEntry.findUnique({
          where: { idempotencyKey },
        });

        if (existing) {
          return { success: true, alreadyGranted: true };
        }

        // 2. Ensure balance exists
        const balance = await tx.aiCreditBalance.findUnique({
          where: { organizationId },
        });

        if (!balance) {
          const now = new Date();
          await tx.aiCreditBalance.create({
            data: {
              organizationId,
              monthlyAllowance: 50,
              monthlyUsed: 0,
              reservedCredits: 0,
              purchasedCredits: amount,
              billingPeriodStart: now,
              billingPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        } else {
          // Increment non-expiring purchased credits
          await tx.aiCreditBalance.update({
            where: { organizationId },
            data: {
              purchasedCredits: { increment: amount },
            },
          });
        }

        // 3. Append immutable ledger entry
        await tx.aiCreditLedgerEntry.create({
          data: {
            organizationId,
            entryType: LedgerEntryType.PURCHASE_GRANT,
            debitAccount: "SYSTEM_PURCHASED_POOL",
            creditAccount: "CUSTOMER_PURCHASED_CREDITS",
            amount,
            feature: "credit_pack_purchase",
            providerCost: providerCostUsd,
            idempotencyKey,
            createdAt: new Date(),
          },
        });

        return { success: true, alreadyGranted: false };
      });
    } catch (err: any) {
      console.error("[CreditService.grantPurchasedCredits] Error:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Adjusts monthly allowance on mid-cycle subscription upgrade or downgrade.
   */
  public static async updateTierAllowance(
    organizationId: string,
    newAllowance: number,
    idempotencyKey: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.aiCreditLedgerEntry.findUnique({
          where: { idempotencyKey },
        });
        if (existing) {
          return { success: true };
        }

        const balance = await tx.aiCreditBalance.findUnique({
          where: { organizationId },
        });

        if (balance) {
          await tx.aiCreditBalance.update({
            where: { organizationId },
            data: { monthlyAllowance: newAllowance },
          });
        }

        await tx.aiCreditLedgerEntry.create({
          data: {
            organizationId,
            entryType: LedgerEntryType.ALLOWANCE_GRANT,
            debitAccount: "SYSTEM_TIER_ADJUSTMENT",
            creditAccount: "CUSTOMER_MONTHLY_ALLOWANCE",
            amount: newAllowance,
            feature: "plan_tier_update",
            providerCost: 0.0,
            idempotencyKey,
            createdAt: new Date(),
          },
        });

        return { success: true };
      });
    } catch (err: any) {
      console.error("[CreditService.updateTierAllowance] Error:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Safely deducts purchased credits on refund.
   */
  public static async refundPurchasedCredits(
    organizationId: string,
    amount: number,
    idempotencyKey: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.aiCreditLedgerEntry.findUnique({
          where: { idempotencyKey },
        });
        if (existing) {
          return { success: true };
        }

        const balance = await tx.aiCreditBalance.findUnique({
          where: { organizationId },
        });

        if (balance) {
          const deductAmount = Math.min(balance.purchasedCredits, amount);
          await tx.aiCreditBalance.update({
            where: { organizationId },
            data: {
              purchasedCredits: { decrement: deductAmount },
            },
          });
        }

        await tx.aiCreditLedgerEntry.create({
          data: {
            organizationId,
            entryType: LedgerEntryType.REFUND_CREDIT,
            debitAccount: "CUSTOMER_PURCHASED_CREDITS",
            creditAccount: "SYSTEM_PURCHASED_POOL",
            amount,
            feature: "credit_pack_refund",
            providerCost: 0.0,
            idempotencyKey,
            createdAt: new Date(),
          },
        });

        return { success: true };
      });
    } catch (err: any) {
      console.error("[CreditService.refundPurchasedCredits] Error:", err);
      return { success: false, error: err.message };
    }
  }
}
