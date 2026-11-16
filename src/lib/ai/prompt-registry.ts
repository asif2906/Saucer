import {
  CaptionRequest,
  HashtagsRequest,
  RewriteRequest,
  AdaptRequest,
  ThreadRequest,
  VisionRequest,
  CalendarRequest,
} from "./types";

export class PromptRegistry {
  public static getSystemInstruction(): string {
    return `You are Saucer AI, a world-class social media strategist and copywriting expert.
Your goal is to generate high-performing, authentic, and platform-native content that maximizes audience engagement.
Adhere strictly to the requested tone, platform formatting conventions, character constraints, and JSON response structure.
Do not hallucinate facts. Do not output markdown code blocks unless requested. Provide valid, parseable JSON conforming to the requested schema.`;
  }

  public static getCaptionPrompt(req: CaptionRequest): string {
    const platformRules = {
      x: "Keep punchy, under 280 characters, strong hook in the first sentence, max 2 relevant hashtags.",
      linkedin: "Professional, structured with line breaks, storytelling hook, actionable takeaway, conversational CTA.",
      instagram: "Engaging hook, relatable narrative, clean visual layout, spacing, evocative vocabulary.",
      facebook: "Community-driven, conversational, invites comments/discussions, clear question CTA.",
      general: "Balanced, engaging, clear value proposition with a call-to-action.",
    }[req.platform];

    return `Generate an engaging social media post caption based on the following requirements:
Topic: "${req.topic}"
Platform: ${req.platform.toUpperCase()} (${platformRules})
Tone of voice: ${req.tone}
Include emojis: ${req.includeEmojis ? "Yes" : "No"}
${req.keywords && req.keywords.length > 0 ? `Target keywords to include: ${req.keywords.join(", ")}` : ""}

Respond ONLY with a JSON object in this exact format:
{
  "caption": "The complete generated post text including line breaks",
  "suggestedHashtags": ["tag1", "tag2", "tag3"],
  "characterCount": 140
}`;
  }

  public static getHashtagsPrompt(req: HashtagsRequest): string {
    return `Analyze the following content and generate ${req.count} high-reach, highly relevant social media hashtags and complementary emojis for ${req.platform.toUpperCase()}:
Content: "${req.content}"

Select a mix of broad industry tags, trending niche tags, and community tags.
Respond ONLY with a JSON object in this exact format:
{
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "recommendedEmojis": ["🚀", "💡", "🔥"],
  "relevanceExplanation": "Brief 1-sentence note on why these hashtags match the content."
}`;
  }

  public static getRewritePrompt(req: RewriteRequest): string {
    return `Rewrite the following social media post with a distinct "${req.tone.toUpperCase()}" tone:
Original Content: "${req.content}"
${req.targetAudience ? `Target Audience: ${req.targetAudience}` : ""}

Preserve the core message and facts while completely revamping the pacing, vocabulary, and hook to match the target tone.
Respond ONLY with a JSON object in this exact format:
{
  "rewrittenContent": "The rewritten post text",
  "toneApplied": "${req.tone}",
  "changesSummary": "Brief summary of stylistic changes made"
}`;
  }

  public static getAdaptPrompt(req: AdaptRequest): string {
    return `Adapt the following source content into platform-native posts for these specific networks: ${req.targetPlatforms.join(", ").toUpperCase()}.

Source Content: "${req.originalContent}"

Rules per platform:
- X: Strict limit of 280 characters. High-impact single post.
- LinkedIn: Deep insight format, 1,000-2,000 characters with whitespace and professional framing.
- Instagram: Visual-first caption with emoji bullets and relevant hashtag cluster at end.
- Facebook: Friendly, engaging, question-driven tone.

Respond ONLY with a JSON object in this exact format:
{
  "adaptations": {
    "x": {
      "content": "...",
      "characterCount": 180,
      "characterLimit": 280,
      "withinLimit": true,
      "tips": "Optimized for retweets"
    }
  }
}`;
  }

  public static getThreadPrompt(req: ThreadRequest): string {
    return `Create a viral ${req.tweetCount}-part X (Twitter) thread on the following topic:
Topic: "${req.topic}"
Hook Style: "${req.hookStyle}" (e.g. contrarian statement, provocative question, or eye-opening statistic)

Thread Structure:
- Tweet 1: Magnetic hook + bookmark incentive.
- Tweets 2-${req.tweetCount - 1}: Actionable steps, insights, examples, or frameworks.
- Tweet ${req.tweetCount}: Summary takeaway + call to action (follow, retweet, or reply).
Every single tweet MUST be under 280 characters.

Respond ONLY with a JSON object in this exact format:
{
  "thread": [
    { "index": 1, "text": "...", "characterCount": 210 },
    { "index": 2, "text": "...", "characterCount": 190 }
  ],
  "hookType": "${req.hookStyle}"
}`;
  }

  public static getVisionPrompt(req: VisionRequest): string {
    return `Analyze this image in detail and write engaging social media captions for ${req.platform.toUpperCase()}.
${req.prompt ? `Additional context: ${req.prompt}` : ""}

Provide:
1. An accurate description of key visual elements, mood, and focal subject.
2. 3 caption options (Short/Punchy, Story/Narrative, Question/Engagement).
3. 5-8 relevant hashtags.
4. Visual tags describing colors, objects, and scene setting.

Respond ONLY with a JSON object in this exact format:
{
  "description": "Visual summary of the image",
  "captions": ["Option 1...", "Option 2...", "Option 3..."],
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "visualTags": ["modern office", "warm lighting", "productivity"]
}`;
  }

  public static getCalendarPrompt(req: CalendarRequest): string {
    return `Create a high-impact 7-Day Social Media Content Calendar for the following niche:
Niche / Industry: "${req.industryOrNiche}"
${req.goals ? `Goals: ${req.goals}` : "Goals: Audience growth, engagement, thought leadership."}
Target Networks: ${req.platforms.join(", ").toUpperCase()}

Provide exactly 7 days (Day 1 through Day 7) of planned content with diverse content types (Educational, Behind-The-Scenes, Contrarian, Social Proof, How-To, Community Question, Inspirational).

Respond ONLY with a JSON object in this exact format:
{
  "niche": "${req.industryOrNiche}",
  "schedule": [
    {
      "day": "Day 1 (Monday)",
      "theme": "Educational Framework",
      "hook": "Attention-grabbing first line",
      "contentIdea": "Detailed outline of what to post",
      "recommendedPlatform": "linkedin",
      "mediaType": "Carousel / Image"
    }
  ]
}`;
  }
}
