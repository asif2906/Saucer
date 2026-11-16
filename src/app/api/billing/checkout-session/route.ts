import { NextRequest, NextResponse } from "next/server";
import { getBillingAuthContext } from "@/lib/billing/auth-context";
import { BillingService } from "@/lib/billing/billing.service";
import { SubscriptionTier, BillingInterval } from "@prisma/client";
import { z } from "zod";

const CheckoutSessionSchema = z.object({
  tier: z.enum(["FREE", "PRO", "AGENCY", "ENTERPRISE"]).optional(),
  billingPeriod: z.enum(["MONTHLY", "YEARLY"]).optional(),
  creditPack: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await getBillingAuthContext();
  if (!auth.success) {
    return auth.response;
  }

  try {
    const body = await req.json();
    const validation = CheckoutSessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid checkout request format", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { tier, billingPeriod, creditPack } = validation.data;

    const result = await BillingService.createCheckoutSession({
      organizationId: auth.context.organizationId,
      userId: auth.context.userId,
      userEmail: auth.context.email,
      userName: auth.context.fullName,
      tier: tier ? (tier as SubscriptionTier) : undefined,
      billingPeriod: billingPeriod ? (billingPeriod as BillingInterval) : undefined,
      creditPack,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      checkoutUrl: result.checkoutUrl,
    });
  } catch (err: any) {
    console.error("[API /api/billing/checkout-session] Error:", err);
    return NextResponse.json(
      { error: "Internal server error creating checkout session", message: err.message },
      { status: 500 }
    );
  }
}
