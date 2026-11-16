import { NextRequest, NextResponse } from "next/server";
import { getBillingAuthContext } from "@/lib/billing/auth-context";
import { BillingService } from "@/lib/billing/billing.service";

export async function POST(req: NextRequest) {
  const auth = await getBillingAuthContext();
  if (!auth.success) {
    return auth.response;
  }

  // Restrict billing portal access to admins/owners
  if (auth.context.orgRole !== "OWNER" && auth.context.orgRole !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only organization administrators can access the billing portal." },
      { status: 403 }
    );
  }

  try {
    const result = await BillingService.createCustomerPortalSession(
      auth.context.organizationId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      portalUrl: result.portalUrl,
    });
  } catch (err: any) {
    console.error("[API /api/billing/customer-portal] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate customer portal session", message: err.message },
      { status: 500 }
    );
  }
}
