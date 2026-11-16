import { NextRequest, NextResponse } from "next/server";
import { getPublishingAuthContext } from "@/lib/publishing/auth-helper";
import { PublishingService } from "@/lib/publishing/publishing.service";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const auth = await getPublishingAuthContext();
    if (!auth.success) return auth.response;

    const body = await req.json();
    const {
      content,
      postType,
      scheduledAt,
      timezone,
      publishNow,
      variants,
      workspaceId: reqWorkspaceId,
    } = body;

    const workspaceId = reqWorkspaceId || auth.context.workspaceId;

    if (!content || !variants || variants.length === 0) {
      return NextResponse.json(
        { error: "Content and at least one target channel variant are required." },
        { status: 400 }
      );
    }

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
    if (scheduledDate && isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid scheduled date timestamp format." },
        { status: 400 }
      );
    }

    if (scheduledDate && scheduledDate.getTime() <= Date.now() && !publishNow) {
      return NextResponse.json(
        { error: "Scheduled date must be in the future." },
        { status: 400 }
      );
    }

    const result = await PublishingService.createPost({
      organizationId: auth.context.organizationId,
      workspaceId,
      createdById: auth.context.profileId,
      content,
      postType,
      scheduledAt: scheduledDate,
      timezone: timezone || "UTC",
      publishNow: !!publishNow,
      variants,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/publishing/posts] Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getPublishingAuthContext();
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");
    const workspaceId = searchParams.get("workspaceId") || auth.context.workspaceId;

    if (view === "queue") {
      const posts = await PublishingService.listQueue(workspaceId);
      return NextResponse.json({ posts });
    }

    if (view === "history") {
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const posts = await PublishingService.listHistory(workspaceId, limit);
      return NextResponse.json({ posts });
    }

    if (view === "calendar") {
      const startParam = searchParams.get("startDate");
      const endParam = searchParams.get("endDate");
      const startDate = startParam ? new Date(startParam) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
      const endDate = endParam ? new Date(endParam) : new Date(Date.now() + 60 * 24 * 3600 * 1000);

      const posts = await PublishingService.getCalendarPosts(workspaceId, startDate, endDate);
      return NextResponse.json({ posts });
    }

    // Default list all workspace posts
    const statusParam = searchParams.get("status") as PostStatus | null;
    const whereClause: any = { workspaceId };
    if (statusParam) {
      whereClause.status = statusParam;
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (err: any) {
    console.error("[GET /api/publishing/posts] Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
