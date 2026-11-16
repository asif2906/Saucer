import { CreditService } from "@/lib/credits/credit.service";
import { GlobalQuotaController } from "./quota-controller";
import { ModelRouter } from "./model-router";
import { PromptRegistry } from "./prompt-registry";
import { GeminiProvider } from "./providers/gemini.provider";
import {
  AiOperation,
  CaptionRequest,
  CaptionResponse,
  CaptionResponseSchema,
  HashtagsRequest,
  HashtagsResponse,
  HashtagsResponseSchema,
  RewriteRequest,
  RewriteResponse,
  RewriteResponseSchema,
  AdaptRequest,
  AdaptResponse,
  AdaptResponseSchema,
  ThreadRequest,
  ThreadResponse,
  ThreadResponseSchema,
  VisionRequest,
  VisionResponse,
  VisionResponseSchema,
  CalendarRequest,
  CalendarResponse,
  CalendarResponseSchema,
} from "./types";

export interface AiExecutionResult<T> {
  data: T;
  meta: {
    modelUsed: string;
    inputTokens: number;
    outputTokens: number;
    remainingCredits: number;
    reservationId: string;
  };
}

export class AiService {
  /**
   * Internal orchestrator that wraps credit reservation, quota verification,
   * Gemini execution, response validation, and atomic credit settlement.
   */
  private static async executeWithLifecycle<T>(
    organizationId: string,
    userId: string,
    operation: AiOperation,
    idempotencyKey: string,
    generator: (primaryModel: string, fallbackModel: string) => Promise<{
      parsedJson: any;
      inputTokens: number;
      outputTokens: number;
      modelUsed: string;
    }>,
    validator: (raw: any) => T
  ): Promise<AiExecutionResult<T>> {
    // 1. Reserve credits atomically
    const reserveRes = await CreditService.reserveCredits(
      organizationId,
      userId,
      operation,
      idempotencyKey
    );

    if (!reserveRes.success || !reserveRes.reservationId) {
      throw new Error(reserveRes.error || "Unable to reserve AI credits for this operation.");
    }

    const reservationId = reserveRes.reservationId;

    // 2. Check and reserve shared Google API global quota
    const quotaRes = await GlobalQuotaController.reserveQuota(500);
    if (!quotaRes.allowed) {
      // Refund reserved credits immediately
      await CreditService.releaseCredits(reservationId, "Global quota check rejection");
      throw new Error(quotaRes.reason || "Google Gemini free-tier quota is currently exhausted. Please try again shortly.");
    }

    // 3. Resolve model routing
    const { primaryModel, fallbackModel } = ModelRouter.resolveModel(operation);

    try {
      // 4. Execute generation with Gemini provider
      const genResult = await generator(primaryModel, fallbackModel);

      // 5. Validate schema with Zod
      const validatedData = validator(genResult.parsedJson);

      // 6. Settle credits upon verified valid output
      const settleRes = await CreditService.settleCredits(reservationId, {
        model: genResult.modelUsed,
        feature: operation,
        inputTokens: genResult.inputTokens,
        outputTokens: genResult.outputTokens,
      });

      // 7. Release concurrent quota slot
      await GlobalQuotaController.releaseQuota(genResult.inputTokens + genResult.outputTokens);

      return {
        data: validatedData,
        meta: {
          modelUsed: genResult.modelUsed,
          inputTokens: genResult.inputTokens,
          outputTokens: genResult.outputTokens,
          remainingCredits: settleRes.remainingCredits ?? 0,
          reservationId,
        },
      };
    } catch (err: any) {
      // Release reservation and concurrent quota slot safely
      await CreditService.releaseCredits(reservationId, `Generation error: ${err.message}`);
      await GlobalQuotaController.releaseQuota();
      throw err;
    }
  }

  // ----------------------------------------------------
  // PUBLIC FEATURE API
  // ----------------------------------------------------

  public static async generateCaption(
    organizationId: string,
    userId: string,
    req: CaptionRequest
  ): Promise<AiExecutionResult<CaptionResponse>> {
    const key = req.idempotencyKey || `cap-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return this.executeWithLifecycle<CaptionResponse>(
      organizationId,
      userId,
      "caption",
      key,
      async (primary, fallback) => {
        const prompt = PromptRegistry.getCaptionPrompt(req);
        const sys = PromptRegistry.getSystemInstruction();
        const res = await GeminiProvider.generateContent(prompt, sys, primary, fallback);
        return {
          parsedJson: { ...res.rawJson, modelUsed: res.modelUsed },
          inputTokens: res.inputTokens,
          outputTokens: res.outputTokens,
          modelUsed: res.modelUsed,
        };
      },
      (raw) => CaptionResponseSchema.parse(raw)
    );
  }

  public static async suggestHashtags(
    organizationId: string,
    userId: string,
    req: HashtagsRequest
  ): Promise<AiExecutionResult<HashtagsResponse>> {
    const key = req.idempotencyKey || `hash-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return this.executeWithLifecycle<HashtagsResponse>(
      organizationId,
      userId,
      "hashtags",
      key,
      async (primary, fallback) => {
        const prompt = PromptRegistry.getHashtagsPrompt(req);
        const sys = PromptRegistry.getSystemInstruction();
        const res = await GeminiProvider.generateContent(prompt, sys, primary, fallback);
        return {
          parsedJson: res.rawJson,
          inputTokens: res.inputTokens,
          outputTokens: res.outputTokens,
          modelUsed: res.modelUsed,
        };
      },
      (raw) => HashtagsResponseSchema.parse(raw)
    );
  }

  public static async rewriteTone(
    organizationId: string,
    userId: string,
    req: RewriteRequest
  ): Promise<AiExecutionResult<RewriteResponse>> {
    const key = req.idempotencyKey || `rew-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return this.executeWithLifecycle<RewriteResponse>(
      organizationId,
      userId,
      "rewrite",
      key,
      async (primary, fallback) => {
        const prompt = PromptRegistry.getRewritePrompt(req);
        const sys = PromptRegistry.getSystemInstruction();
        const res = await GeminiProvider.generateContent(prompt, sys, primary, fallback);
        return {
          parsedJson: res.rawJson,
          inputTokens: res.inputTokens,
          outputTokens: res.outputTokens,
          modelUsed: res.modelUsed,
        };
      },
      (raw) => RewriteResponseSchema.parse(raw)
    );
  }

  public static async adaptMultiPlatform(
    organizationId: string,
    userId: string,
    req: AdaptRequest
  ): Promise<AiExecutionResult<AdaptResponse>> {
    const key = req.idempotencyKey || `adp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return this.executeWithLifecycle<AdaptResponse>(
      organizationId,
      userId,
      "adapt",
      key,
      async (primary, fallback) => {
        const prompt = PromptRegistry.getAdaptPrompt(req);
        const sys = PromptRegistry.getSystemInstruction();
        const res = await GeminiProvider.generateContent(prompt, sys, primary, fallback);
        return {
          parsedJson: res.rawJson,
          inputTokens: res.inputTokens,
          outputTokens: res.outputTokens,
          modelUsed: res.modelUsed,
        };
      },
      (raw) => AdaptResponseSchema.parse(raw)
    );
  }

  public static async generateThread(
    organizationId: string,
    userId: string,
    req: ThreadRequest
  ): Promise<AiExecutionResult<ThreadResponse>> {
    const key = req.idempotencyKey || `thr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return this.executeWithLifecycle<ThreadResponse>(
      organizationId,
      userId,
      "thread",
      key,
      async (primary, fallback) => {
        const prompt = PromptRegistry.getThreadPrompt(req);
        const sys = PromptRegistry.getSystemInstruction();
        const res = await GeminiProvider.generateContent(prompt, sys, primary, fallback);
        return {
          parsedJson: res.rawJson,
          inputTokens: res.inputTokens,
          outputTokens: res.outputTokens,
          modelUsed: res.modelUsed,
        };
      },
      (raw) => ThreadResponseSchema.parse(raw)
    );
  }

  public static async imageToCaption(
    organizationId: string,
    userId: string,
    req: VisionRequest
  ): Promise<AiExecutionResult<VisionResponse>> {
    const key = req.idempotencyKey || `vis-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return this.executeWithLifecycle<VisionResponse>(
      organizationId,
      userId,
      "vision",
      key,
      async (primary, fallback) => {
        const prompt = PromptRegistry.getVisionPrompt(req);
        const sys = PromptRegistry.getSystemInstruction();
        const res = await GeminiProvider.generateVision(
          req.imageBase64,
          req.mimeType,
          prompt,
          sys,
          primary,
          fallback
        );
        return {
          parsedJson: res.rawJson,
          inputTokens: res.inputTokens,
          outputTokens: res.outputTokens,
          modelUsed: res.modelUsed,
        };
      },
      (raw) => VisionResponseSchema.parse(raw)
    );
  }

  public static async generateCalendar(
    organizationId: string,
    userId: string,
    req: CalendarRequest
  ): Promise<AiExecutionResult<CalendarResponse>> {
    const key = req.idempotencyKey || `cal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return this.executeWithLifecycle<CalendarResponse>(
      organizationId,
      userId,
      "calendar",
      key,
      async (primary, fallback) => {
        const prompt = PromptRegistry.getCalendarPrompt(req);
        const sys = PromptRegistry.getSystemInstruction();
        const res = await GeminiProvider.generateContent(prompt, sys, primary, fallback);
        return {
          parsedJson: res.rawJson,
          inputTokens: res.inputTokens,
          outputTokens: res.outputTokens,
          modelUsed: res.modelUsed,
        };
      },
      (raw) => CalendarResponseSchema.parse(raw)
    );
  }
}
