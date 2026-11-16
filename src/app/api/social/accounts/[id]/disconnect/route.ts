import { NextRequest, NextResponse } from "next/server";
import { getSocialAuthContext } from "@/lib/social/auth-context";
import { SocialAccountService } from "@/lib/social/social-account.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getSocialAuthContext();
  if (!auth.success) {
    return auth.response;
  }

  const { id: accountId } = await params;

  try {
    const result = await SocialAccountService.disconnectAccount(
      auth.context.workspaceId,
      accountId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Account disconnected successfully." });
  } catch (err: any) {
    console.error("[API disconnect account] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
