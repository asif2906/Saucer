import { NextRequest, NextResponse } from "next/server";
import { getPublishingAuthContext } from "@/lib/publishing/auth-helper";
import { NotificationService } from "@/lib/notifications/notification.service";

export async function GET(req: NextRequest) {
  try {
    const auth = await getPublishingAuthContext();
    if (!auth.success) return auth.response;

    const notifications = await NotificationService.listNotifications(auth.context.workspaceId);
    return NextResponse.json({ notifications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
