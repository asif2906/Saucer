import { AiOperation } from "./types";

export interface ModelRoutingConfig {
  primaryModel: string;
  fallbackModel: string;
}

export class ModelRouter {
  public static getPrimaryModel(): string {
    return process.env.GEMINI_DEFAULT_MODEL || "gemini-3.8-flash";
  }

  public static getFallbackModel(): string {
    return process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";
  }

  /**
   * Routes the given operation to the optimal free-tier model.
   * Lighter operations (like hashtags or quick tone check) can use flash-lite directly,
   * while complex operations (thread, calendar, vision) use 3.8-flash.
   */
  public static resolveModel(operation: AiOperation, forceLightweight: boolean = false): ModelRoutingConfig {
    const primary = this.getPrimaryModel();
    const fallback = this.getFallbackModel();

    if (forceLightweight || operation === "hashtags") {
      return {
        primaryModel: fallback,
        fallbackModel: primary,
      };
    }

    return {
      primaryModel: primary,
      fallbackModel: fallback,
    };
  }
}
