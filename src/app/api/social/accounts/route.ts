import { NextRequest, NextResponse } from "next/server";
import { getSocialAuthContext } from "@/lib/social/auth-context";
import { SocialAccountService } from "@/lib/social/social-account.service";

export async function GET(req: NextRequest) {
  const auth = await getSocialAuthContext();
  if (!auth.success) {
    return auth.response;
  }

  try {
    const accounts = await SocialAccountService.getAccounts(auth.context.workspaceId);
    return NextResponse.json({
      success: true,
      accounts,
      workspaceId: auth.context.workspaceId,
      organizationId: auth.context.organizationId,
    });
  } catch (err: any) {
    console.error("[API /api/social/accounts] Error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve social accounts", message: err.message },
      { status: 500 }
    );
  }
}
