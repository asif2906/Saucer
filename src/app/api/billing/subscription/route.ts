import { NextRequest, NextResponse } from "next/server";
import { getBillingAuthContext } from "@/lib/billing/auth-context";
import { BillingService } from "@/lib/billing/billing.service";

export async function GET(req: NextRequest) {
  const auth = await getBillingAuthContext();
  if (!auth.success) {
    return auth.response;
  }

  try {
    const overview = await BillingService.getBillingOverview(
      auth.context.organizationId
    );

    return NextResponse.json({
      success: true,
      ...overview,
    });
  } catch (err: any) {
    console.error("[API /api/billing/subscription] Error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve billing overview", message: err.message },
      { status: 500 }
    );
  }
}
