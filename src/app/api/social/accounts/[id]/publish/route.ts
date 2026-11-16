import { NextRequest, NextResponse } from "next/server";
import { getSocialAuthContext } from "@/lib/social/auth-context";
import { SocialAccountService } from "@/lib/social/social-account.service";
import { z } from "zod";

const PublishSchema = z.object({
  content: z.string(),
  media: z
    .array(
      z.object({
        url: z.string().url(),
        mediaType: z.enum(["image", "video"]),
        altText: z.string().optional(),
      })
    )
    .optional(),
  settings: z.record(z.any()).optional(),
});

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
    const body = await req.json();
    const validation = PublishSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid publishing payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const result = await SocialAccountService.publishPost(
      auth.context.workspaceId,
      accountId,
      validation.data
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, errorCode: result.errorCode },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      postId: result.postId,
      platformPostUrl: result.platformPostUrl,
      status: result.status,
    });
  } catch (err: any) {
    console.error("[API publish post] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
