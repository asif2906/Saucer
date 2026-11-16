import { NextRequest, NextResponse } from "next/server";
import { PublishingService } from "@/lib/publishing/publishing.service";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    const results = await PublishingService.runDueJobReconciliation(20);
    return NextResponse.json({
      success: true,
      executed: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
