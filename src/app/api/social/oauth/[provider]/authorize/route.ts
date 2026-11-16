import { NextRequest, NextResponse } from "next/server";
import { getSocialAuthContext } from "@/lib/social/auth-context";
import { SocialAccountService } from "@/lib/social/social-account.service";
import { SocialProvider } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const auth = await getSocialAuthContext();
  if (!auth.success) {
    return auth.response;
  }

  const { provider: rawProvider } = await params;
  const provider = rawProvider.toUpperCase() as SocialProvider;

  if (!Object.values(SocialProvider).includes(provider)) {
    return NextResponse.json(
      { error: `Unsupported social provider: ${rawProvider}` },
      { status: 400 }
    );
  }

  try {
    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${origin}/api/social/oauth/${rawProvider.toLowerCase()}/callback`;

    const { authUrl, state } = await SocialAccountService.initiateOAuth({
      organizationId: auth.context.organizationId,
      workspaceId: auth.context.workspaceId,
      userId: auth.context.userId,
      provider,
      redirectUri,
      returnUrl: `${origin}/app/social-accounts`,
    });

    return NextResponse.json({
      success: true,
      authUrl,
      state,
      redirectUri,
    });
  } catch (err: any) {
    console.error(`[OAuth Authorize ${provider}] Error:`, err);
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}
