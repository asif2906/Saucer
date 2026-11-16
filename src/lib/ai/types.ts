import { z } from "zod";

export type AiOperation =
  | "caption"
  | "hashtags"
  | "rewrite"
  | "adapt"
  | "thread"
  | "vision"
  | "calendar";

// Fixed backend-defined feature credit costs (never trust client amounts)
export const AI_FEATURE_COSTS: Record<AiOperation, number> = {
  caption: 1,
  hashtags: 1,
  rewrite: 1,
  adapt: 2,
  thread: 3,
  vision: 2,
  calendar: 5,
};

// Input Request Schemas
export const CaptionRequestSchema = z.object({
  topic: z.string().min(3).max(1000),
  platform: z.enum(["x", "linkedin", "instagram", "facebook", "general"]).default("general"),
  tone: z.string().default("professional"),
  keywords: z.array(z.string()).optional(),
  includeEmojis: z.boolean().default(true),
  idempotencyKey: z.string().optional(),
});
export type CaptionRequest = z.infer<typeof CaptionRequestSchema>;

export const HashtagsRequestSchema = z.object({
  content: z.string().min(5).max(3000),
  platform: z.enum(["x", "linkedin", "instagram", "facebook", "general"]).default("general"),
  count: z.number().int().min(3).max(30).default(10),
  idempotencyKey: z.string().optional(),
});
export type HashtagsRequest = z.infer<typeof HashtagsRequestSchema>;

export const RewriteRequestSchema = z.object({
  content: z.string().min(5).max(3000),
  tone: z.enum(["professional", "casual", "urgent", "witty", "educational", "storytelling"]).default("professional"),
  targetAudience: z.string().optional(),
  idempotencyKey: z.string().optional(),
});
export type RewriteRequest = z.infer<typeof RewriteRequestSchema>;

export const AdaptRequestSchema = z.object({
  originalContent: z.string().min(5).max(3000),
  targetPlatforms: z.array(z.enum(["x", "linkedin", "instagram", "facebook"])).min(1),
  idempotencyKey: z.string().optional(),
});
export type AdaptRequest = z.infer<typeof AdaptRequestSchema>;

export const ThreadRequestSchema = z.object({
  topic: z.string().min(5).max(2000),
  tweetCount: z.number().int().min(3).max(15).default(5),
  hookStyle: z.enum(["question", "contrarian", "statistic", "story", "direct"]).default("contrarian"),
  idempotencyKey: z.string().optional(),
});
export type ThreadRequest = z.infer<typeof ThreadRequestSchema>;

export const VisionRequestSchema = z.object({
  imageBase64: z.string().min(20),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]).default("image/jpeg"),
  prompt: z.string().max(1000).optional(),
  platform: z.enum(["instagram", "x", "linkedin", "facebook", "general"]).default("instagram"),
  idempotencyKey: z.string().optional(),
});
export type VisionRequest = z.infer<typeof VisionRequestSchema>;

export const CalendarRequestSchema = z.object({
  industryOrNiche: z.string().min(3).max(200),
  goals: z.string().max(500).optional(),
  platforms: z.array(z.enum(["x", "linkedin", "instagram", "facebook"])).min(1).default(["x", "linkedin"]),
  idempotencyKey: z.string().optional(),
});
export type CalendarRequest = z.infer<typeof CalendarRequestSchema>;

// Output Response Schemas (Strictly validated with Zod)
export const CaptionResponseSchema = z.object({
  caption: z.string().min(1),
  suggestedHashtags: z.array(z.string()).default([]),
  characterCount: z.number().int(),
  modelUsed: z.string(),
});
export type CaptionResponse = z.infer<typeof CaptionResponseSchema>;

export const HashtagsResponseSchema = z.object({
  hashtags: z.array(z.string()).min(1),
  recommendedEmojis: z.array(z.string()).default([]),
  relevanceExplanation: z.string().optional(),
});
export type HashtagsResponse = z.infer<typeof HashtagsResponseSchema>;

export const RewriteResponseSchema = z.object({
  rewrittenContent: z.string().min(1),
  toneApplied: z.string(),
  changesSummary: z.string().optional(),
});
export type RewriteResponse = z.infer<typeof RewriteResponseSchema>;

export const AdaptResponseSchema = z.object({
  adaptations: z.record(
    z.string(),
    z.object({
      content: z.string(),
      characterCount: z.number(),
      characterLimit: z.number(),
      withinLimit: z.boolean(),
      tips: z.string().optional(),
    })
  ),
});
export type AdaptResponse = z.infer<typeof AdaptResponseSchema>;

export const ThreadResponseSchema = z.object({
  thread: z.array(
    z.object({
      index: z.number(),
      text: z.string(),
      characterCount: z.number(),
    })
  ).min(2),
  hookType: z.string().optional(),
});
export type ThreadResponse = z.infer<typeof ThreadResponseSchema>;

export const VisionResponseSchema = z.object({
  description: z.string(),
  captions: z.array(z.string()).min(1),
  hashtags: z.array(z.string()).default([]),
  visualTags: z.array(z.string()).default([]),
});
export type VisionResponse = z.infer<typeof VisionResponseSchema>;

export const CalendarResponseSchema = z.object({
  niche: z.string(),
  schedule: z.array(
    z.object({
      day: z.string(),
      theme: z.string(),
      hook: z.string(),
      contentIdea: z.string(),
      recommendedPlatform: z.string(),
      mediaType: z.string(),
    })
  ).length(7),
});
export type CalendarResponse = z.infer<typeof CalendarResponseSchema>;
