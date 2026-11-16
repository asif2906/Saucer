import { NextRequest, NextResponse } from "next/server";
import { getPublishingAuthContext } from "@/lib/publishing/auth-helper";
import { PublishingService } from "@/lib/publishing/publishing.service";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getPublishingAuthContext();
    if (!auth.success) return auth.response;

    const { id } = await params;
    const post = await prisma.post.findFirst({
      where: {
        id,
        workspaceId: auth.context.workspaceId,
      },
      include: {
        variants: {
          include: {
            socialAccount: true,
            jobs: {
              include: { attempts: true },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getPublishingAuthContext();
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await req.json();

    const scheduledDate = body.scheduledAt ? new Date(body.scheduledAt) : body.scheduledAt === null ? null : undefined;

    const updated = await PublishingService.updatePost(id, auth.context.workspaceId, {
      content: body.content,
      scheduledAt: scheduledDate,
      timezone: body.timezone,
      variants: body.variants,
    });

    return NextResponse.json({ post: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getPublishingAuthContext();
    if (!auth.success) return auth.response;

    const { id } = await params;
    const cancelled = await PublishingService.cancelPost(id, auth.context.workspaceId);

    return NextResponse.json({ success: true, post: cancelled });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
