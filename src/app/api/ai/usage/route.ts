import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAiContext } from "@/lib/ai/auth-context";
import { prisma } from "@/lib/prisma";
import { GlobalQuotaController } from "@/lib/ai/quota-controller";

export async function GET(req: NextRequest) {
  try {
    const authRes = await getAuthenticatedAiContext();
    if (!authRes.success) return authRes.response;

    const { organizationId } = authRes.context;

    // Fetch recent ledger transactions
    const ledgerEntries = await prisma.aiCreditLedgerEntry.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Fetch global quota metrics
    const globalQuota = await GlobalQuotaController.getQuotaStatus();

    return NextResponse.json({
      organizationId,
      ledgerEntries,
      globalQuota,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch AI usage statistics." },
      { status: 500 }
    );
  }
}
