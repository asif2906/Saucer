import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "@/lib/billing/billing.service";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headersRecord: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersRecord[key.toLowerCase()] = value;
    });

    const result = await BillingService.processWebhook(rawBody, headersRecord);

    if (result.status === "already_processed") {
      return NextResponse.json(
        { status: "already_processed", eventId: result.eventId },
        { status: 200 }
      );
    }

    if (result.status === "error") {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "success",
      eventId: result.eventId,
    });
  } catch (err: any) {
    console.error("[API /api/billing/webhook] Error:", err);
    return NextResponse.json(
      { error: "Webhook processing error", message: err.message },
      { status: 500 }
    );
  }
}
