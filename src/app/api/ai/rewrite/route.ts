import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAiContext } from "@/lib/ai/auth-context";
import { AiService } from "@/lib/ai/ai.service";
import { RewriteRequestSchema } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    const authRes = await getAuthenticatedAiContext();
    if (!authRes.success) return authRes.response;

    const body = await req.json();
    const parsed = RewriteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await AiService.rewriteTone(
      authRes.context.organizationId,
      authRes.context.userId,
      parsed.data
    );

    return NextResponse.json(result);
  } catch (err: any) {
    const status = err.message?.includes("Insufficient") ? 402 : err.message?.includes("quota") ? 429 : 500;
    return NextResponse.json(
      { error: err.message || "Tone rewriting failed." },
      { status }
    );
  }
}
