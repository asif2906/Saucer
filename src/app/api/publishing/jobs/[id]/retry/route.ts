import { NextRequest, NextResponse } from "next/server";
import { getPublishingAuthContext } from "@/lib/publishing/auth-helper";
import { PublishingService } from "@/lib/publishing/publishing.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getPublishingAuthContext();
    if (!auth.success) return auth.response;

    const { id } = await params;
    const result = await PublishingService.retryJob(id, auth.context.workspaceId);

    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Manual retry failed" },
      { status: 400 }
    );
  }
}
