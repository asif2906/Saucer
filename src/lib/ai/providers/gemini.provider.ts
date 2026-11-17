import { GoogleGenAI } from "@google/genai";

export interface GeminiGenerationResult {
  text: string;
  rawJson: any;
  inputTokens: number;
  outputTokens: number;
  modelUsed: string;
}

export class GeminiProvider {
  private static getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the server. AI operations cannot proceed.");
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Cleans model output by stripping markdown code fences like ```json ... ```
   */
  private static extractJson(text: string): string {
    const trimmed = text.trim();
    if (trimmed.startsWith("```")) {
      const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return trimmed;
  }

  /**
   * Generates text/JSON with automatic retry and model fallback.
   */
  public static async generateContent(
    prompt: string,
    systemInstruction: string,
    primaryModel: string,
    fallbackModel: string,
    timeoutMs: number = 30000
  ): Promise<GeminiGenerationResult> {
    const client = this.getClient();
    const modelsToTry = [primaryModel, fallbackModel];
    let lastError: any = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      for (const model of modelsToTry) {
        try {
          const responsePromise = client.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          });

          // Timeout race
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Gemini API request timed out after ${timeoutMs}ms`)), timeoutMs)
          );

          const response: any = await Promise.race([responsePromise, timeoutPromise]);
          const text = response.text || "";
          const cleanJsonStr = this.extractJson(text);
          let parsed: any;
          try {
            parsed = JSON.parse(cleanJsonStr);
          } catch {
            // If JSON parse fails directly, attempt fallback or throw
            parsed = { rawText: text };
          }

          const inputTokens = response.usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4);
          const outputTokens = response.usageMetadata?.candidatesTokenCount || Math.ceil(text.length / 4);

          return {
            text,
            rawJson: parsed,
            inputTokens,
            outputTokens,
            modelUsed: model,
          };
        } catch (err: any) {
          lastError = err;
          console.warn(`[GeminiProvider] Model ${model} generation failed (pass ${attempt + 1}): ${err.message}. Trying next fallback if available.`);
          // If auth error, break early
          if (err.message?.includes("API_KEY_INVALID") || err.message?.includes("PERMISSION_DENIED")) {
            throw err;
          }
        }
      }

      if (attempt < 2) {
        // Exponential backoff to overcome temporary Google Gemini free-tier 503 demand spikes
        const backoffMs = 2000 * (attempt + 1);
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    }

    throw lastError || new Error("All configured Gemini free-tier models failed to generate content.");
  }

  /**
   * Multimodal image-to-caption generation using vision capabilities.
   */
  public static async generateVision(
    imageBase64: string,
    mimeType: string,
    prompt: string,
    systemInstruction: string,
    primaryModel: string,
    fallbackModel: string,
    timeoutMs: number = 30000
  ): Promise<GeminiGenerationResult> {
    const client = this.getClient();
    const modelsToTry = [primaryModel, fallbackModel];
    let lastError: any = null;

    // Clean base64 string if it contains data URI header
    const cleanBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    for (const model of modelsToTry) {
      try {
        const contents = [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ];

        const responsePromise = client.models.generateContent({
          model,
          contents: contents as any,
          config: {
            systemInstruction,
            temperature: 0.6,
            responseMimeType: "application/json",
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini Vision request timed out after ${timeoutMs}ms`)), timeoutMs)
        );

        const response: any = await Promise.race([responsePromise, timeoutPromise]);
        const text = response.text || "";
        const cleanJsonStr = this.extractJson(text);
        const parsed = JSON.parse(cleanJsonStr);

        const inputTokens = response.usageMetadata?.promptTokenCount || 500;
        const outputTokens = response.usageMetadata?.candidatesTokenCount || Math.ceil(text.length / 4);

        return {
          text,
          rawJson: parsed,
          inputTokens,
          outputTokens,
          modelUsed: model,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[GeminiProvider] Vision model ${model} failed: ${err.message}`);
      }
    }

    throw lastError || new Error("Vision generation failed across all free-tier models.");
  }
}
