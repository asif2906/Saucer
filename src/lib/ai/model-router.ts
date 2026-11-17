import { AiOperation } from "./types";

export interface ModelRoutingConfig {
  primaryModel: string;
  fallbackModel: string;
}

export class ModelRouter {
  public static getPrimaryModel(): string {
    return process.env.GEMINI_DEFAULT_MODEL || "gemini-3.5-flash-lite";
  }

  public static getFallbackModel(): string {
    return process.env.GEMINI_FALLBACK_MODEL || "gemini-3.8-flash";
  }

  /**
   * Routes the given operation to the optimal free-tier model.
   * gemini-3.5-flash-lite provides fast, low-latency generation within free tier,
   * falling back automatically to gemini-3.8-flash during temporary spikes.
   */
  public static resolveModel(operation: AiOperation, forceLightweight: boolean = false): ModelRoutingConfig {
    const primary = this.getPrimaryModel();
    const fallback = this.getFallbackModel();

    return {
      primaryModel: primary,
      fallbackModel: fallback,
    };
  }
}
