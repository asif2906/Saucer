import { NextRequest, NextResponse } from "next/server";
import { SocialAccountService } from "@/lib/social/social-account.service";
import { SocialProvider } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: rawProvider } = await params;
  const provider = rawProvider.toUpperCase() as SocialProvider;
  const searchParams = req.nextUrl.searchParams;

  const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${origin}/api/social/oauth/${rawProvider.toLowerCase()}/callback`;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    console.error(`[OAuth Callback ${provider}] Provider error:`, error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/app/social-accounts?error=${encodeURIComponent(errorDescription || error)}`,
        origin
      )
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        `/app/social-accounts?error=${encodeURIComponent("Missing authorization code or state parameter.")}`,
        origin
      )
    );
  }

  try {
    const result = await SocialAccountService.handleOAuthCallback({
      provider,
      code,
      state,
      redirectUri,
    });

    if (!result.success) {
      return NextResponse.redirect(
        new URL(
          `/app/social-accounts?error=${encodeURIComponent(result.error || "OAuth handshake failed")}`,
          origin
        )
      );
    }

    return NextResponse.redirect(
      new URL(
        `/app/social-accounts?connected=true&provider=${rawProvider.toLowerCase()}`,
        origin
      )
    );
  } catch (err: any) {
    console.error(`[OAuth Callback ${provider}] Exception:`, err);
    return NextResponse.redirect(
      new URL(
        `/app/social-accounts?error=${encodeURIComponent(err.message || "Failed to process OAuth connection")}`,
        origin
      )
    );
  }
}
