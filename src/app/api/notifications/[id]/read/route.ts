import { NextRequest, NextResponse } from "next/server";
import { getPublishingAuthContext } from "@/lib/publishing/auth-helper";
import { NotificationService } from "@/lib/notifications/notification.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getPublishingAuthContext();
    if (!auth.success) return auth.response;

    const { id } = await params;
    await NotificationService.markAsRead(id, auth.context.workspaceId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
