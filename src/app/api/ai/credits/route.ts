import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAiContext } from "@/lib/ai/auth-context";
import { CreditService } from "@/lib/credits/credit.service";

export async function GET(req: NextRequest) {
  try {
    const authRes = await getAuthenticatedAiContext();
    if (!authRes.success) return authRes.response;

    const balance = await CreditService.getOrCreateBalance(authRes.context.organizationId);
    const available = CreditService.getAvailableCredits(balance);

    return NextResponse.json({
      monthlyAllowance: balance.monthlyAllowance,
      monthlyUsed: balance.monthlyUsed,
      reservedCredits: balance.reservedCredits,
      purchasedCredits: balance.purchasedCredits,
      availableCredits: available,
      billingPeriodStart: balance.billingPeriodStart,
      billingPeriodEnd: balance.billingPeriodEnd,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch credit balance." },
      { status: 500 }
    );
  }
}
