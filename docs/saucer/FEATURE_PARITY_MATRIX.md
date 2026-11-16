# SAUCER — FEATURE PARITY MATRIX & IMPLEMENTATION STATUS

This document provides a feature-by-feature tracking matrix comparing the reference product (**Postiz**) with the target **Saucer** SaaS platform. 

> [!IMPORTANT]
> In accordance with project instructions, features are marked according to their true implementation state and are not marked complete simply because UI components exist.

**Status Legend:**
- 🔴 **Not Started**: Specification complete; development not yet initiated.
- 🟡 **In Progress**: Active development / partial implementation.
- 🟢 **Implemented**: Code complete; awaiting end-to-end testing.
- 🔵 **Tested**: Automated & manual test journeys verified.
- 🟣 **Production Ready**: Verified in staging, hardened, and documented.
- ⚪ **Blocked / External Dependency**: Dependent on external API approval, developer tier credentials, or third-party approval.

---

## 1. Authentication & User Management

| Feature / Capability | Postiz Reference | Saucer Target | Target Status | Technical Notes |
| :--- | :--- | :--- | :---: | :--- |
| Email / Password Registration | Custom JWT + Bcrypt | Supabase Auth / Secure JWT | 🔴 Not Started | Email verification required via Resend/SMTP |
| Secure Session Management | HTTP-only, SameSite Cookies | HTTP-only, Secure Cookies | 🔴 Not Started | Multi-tenant organization cookie context |
| Password Reset Flow | One-time token in `UsedCodes` | One-time cryptographically secure token | 🔴 Not Started | Time-limited tokens with rate limiting |
| Google OAuth Sign-in | Google OAuth 2.0 API | Google OAuth 2.0 / Supabase Auth | 🔴 Not Started | Requires Google Cloud Client ID/Secret |
| GitHub OAuth Sign-in | GitHub OAuth App | GitHub OAuth App | 🔴 Not Started | Requires GitHub Developer App |
| Apple Sign-in | Native iOS + Web Services ID | Web Services ID (.p8 key) | 🔴 Not Started | Optional secondary provider |
| Web3 / Wallet Login | Solana / EVM Viem | Postponed for Core SaaS | 🔴 Not Started | Deprioritized in favor of standard SaaS B2B |
| Farcaster Sign-in | Neynar SDK | Postponed for Core SaaS | 🔴 Not Started | Deprioritized in favor of standard SaaS B2B |
| User Profile & Timezone | User model (IANA timezone) | User model (IANA timezone) | 🔴 Not Started | Critical for accurate scheduled publishing |
| Superadmin Role & Guard | `isSuperAdmin` boolean flag | Role-based RBAC + Superadmin | 🔴 Not Started | Secure route protection with audit logging |

---

## 2. Multi-Tenancy & Workspaces

| Feature / Capability | Postiz Reference | Saucer Target | Target Status | Technical Notes |
| :--- | :--- | :--- | :---: | :--- |
| Organization / Workspace Creation | `Organization` model | `Organization` / Workspace model | 🔴 Not Started | Default workspace generated upon registration |
| Multiple Workspaces per Account | Supported via `UserOrganization` | Supported via `UserOrganization` | 🔴 Not Started | Fast workspace switcher in top navigation |
| Role-Based Access Control (RBAC) | USER, ADMIN, SUPERADMIN | USER, EDITOR, ADMIN, OWNER | 🔴 Not Started | CASL authorization policies per section |
| Workspace Team Invitations | Email invite via `UsedCodes` | Email invite with token & expiry | 🔴 Not Started | Seat limit enforced by subscription plan |
| Client / Brand Management | `Customer` model attached to org | `Brand` / Client grouping | 🔴 Not Started | Agency tier capability for client segmentation |
| Content Approval Workflows | Basic order confirmation | Dedicated Post Approval Pipeline | 🔴 Not Started | Editor drafts -> Admin approves -> Scheduled |

---

## 3. Social Media Account Management

| Provider | Postiz Reference | Saucer Target | Target Status | API / Approval Requirements |
| :--- | :--- | :--- | :---: | :--- |
| **X (Twitter)** | OAuth 2.0 PKCE (`x.provider.ts`) | OAuth 2.0 PKCE | ⚪ Blocked / External | Requires X Developer Basic/Pro API access |
| **LinkedIn Personal Profile** | OAuth 2.0 (`linkedin.provider.ts`) | OAuth 2.0 UGC Posts API | ⚪ Blocked / External | Standard LinkedIn Developer App |
| **LinkedIn Company Page** | OAuth 2.0 (`linkedin.page.provider.ts`)| OAuth 2.0 Organization API | ⚪ Blocked / External | Requires `w_organization_social` scope |
| **Facebook Pages & Groups** | Graph API (`facebook.provider.ts`) | Graph API v19+ | ⚪ Blocked / External | Requires Meta Business App Review |
| **Instagram Business / Creator**| Graph API (`instagram.provider.ts`) | Graph API Content Publishing | ⚪ Blocked / External | Requires Meta Business App Review & IG Account |
| **Threads** | Threads API (`threads.provider.ts`) | Threads Official Publishing API | ⚪ Blocked / External | Requires Meta Threads API approval |
| **YouTube** | Google OAuth (`youtube.provider.ts`) | YouTube Data API v3 Videos | ⚪ Blocked / External | Video upload quota verification |
| **TikTok Creator** | Login Kit (`tiktok.provider.ts`) | TikTok Content Posting API | ⚪ Blocked / External | Requires TikTok Developer App Review |
| **TikTok Business** | Business API (`tiktok.business.provider.ts`)| Direct Post Business API | ⚪ Blocked / External | Requires TikTok Commercial Verification |
| **Pinterest** | OAuth 2.0 (`pinterest.provider.ts`) | Pinterest API v5 Pins | ⚪ Blocked / External | Board selection + media upload |
| **Reddit** | OAuth 2.0 (`reddit.provider.ts`) | Reddit API Submit Post | ⚪ Blocked / External | Subreddit flairs, link/text/media rules |
| **Bluesky** | AT Protocol (`bluesky.provider.ts`) | `@atproto/api` agent | 🔴 Not Started | App passwords / OAuth supported |
| **Mastodon** | Mastodon REST (`mastodon.provider.ts`)| Mastodon REST API | 🔴 Not Started | Custom instance SSRF validation required |
| **Google Business Profile** | Google OAuth (`gmb.provider.ts`) | Google My Business API | ⚪ Blocked / External | Organization location verification |
| **Telegram** | Bot API (`telegram.provider.ts`) | Telegram Bot API channels/groups | 🔴 Not Started | Bot token + Chat ID association |
| **Discord** | Webhook / Bot (`discord.provider.ts`) | Discord Bot / Webhook | 🔴 Not Started | Channel selection via Guild Bot |
| **Slack** | OAuth 2.0 Incoming Webhooks | Slack App Bot / Webhooks | 🔴 Not Started | Channel broadcast support |
| **WordPress** | REST API (`wordpress.provider.ts`) | WordPress REST API | 🔴 Not Started | Application Passwords + SSRF protection |
| **Medium** | OAuth 2.0 (`medium.provider.ts`) | Medium Integration Tokens | 🔴 Not Started | Deprecated API; token integration |
| **Dev.to** | API Key (`dev.to.provider.ts`) | Forem API Key | 🔴 Not Started | Direct API key publishing |
| **Hashnode** | Personal Access Token / GraphQL | Hashnode GraphQL API | 🔴 Not Started | Publication ID + Tag validation |
| **Listmonk** | REST API (`listmonk.provider.ts`) | Listmonk Campaign API | 🔴 Not Started | Newsletter dispatch |
| **Farcaster** | Neynar API (`farcaster.provider.ts`)| Warpcast Signer API | 🔴 Not Started | Web3 social; optional |
| **Nostr** | NIP-07 / Private Key | Nostr Relay Publisher | 🔴 Not Started | Web3 decentralized |
| **Dribbble** | OAuth 2.0 (`dribbble.provider.ts`) | Dribbble Shots API | ⚪ Blocked / External | Developer approval required |
| **Skool / Whop / MeWe** | Extension / Cookie / Webhook | Webhook / API if available | 🔴 Not Started | Cookie scraping forbidden; API only |

---

## 4. Post Composer & Multi-Platform Creation

| Feature / Capability | Postiz Reference | Saucer Target | Target Status | Technical Notes |
| :--- | :--- | :--- | :---: | :--- |
| Centralized Rich Post Composer | TipTap WYSIWYG Editor | TipTap / shadcn Prose Editor | 🔴 Not Started | Multi-account channel selector |
| Platform-Specific Post Customization| Per-channel content overrides | Per-channel tab / split editor | 🔴 Not Started | Character counter per platform limits |
| Multi-Media Attachment Support | Images, Videos, Audio, PDF | Multi-asset media manager | 🔴 Not Started | Cloudflare R2 / Supabase Storage |
| Media Normalization & Transcoding | RunPod Serverless FFmpeg | Direct Sharp / Cloudflare / Worker| 🔴 Not Started | Automatic 1080p H.264 mp4 conversion |
| Draft Saving | `State.DRAFT` in database | `State.DRAFT` with auto-save | 🔴 Not Started | Real-time draft persistence |
| Live Post Previews | Channel preview cards | Realistic mobile/desktop previews | 🔴 Not Started | Accurate preview cards for X, LinkedIn, IG |
| Hashtag & Mention Auto-complete | Custom mention component | Built-in suggestion engine | 🔴 Not Started | Tag history per platform |
| First-Comment Scheduling | `Comments` model post-publish | Automated first comment | 🔴 Not Started | Critical for Instagram/LinkedIn reach |
| Short-Linking Integration | Dub, Short.io, Kutt, LinkDrip | Dub / Custom Link Wrapper | 🔴 Not Started | Click tracking & UTM parameter injection |

---

## 5. Visual Content Calendar & Queue

| Feature / Capability | Postiz Reference | Saucer Target | Target Status | Technical Notes |
| :--- | :--- | :--- | :---: | :--- |
| Monthly Calendar View | Custom CSS grid calendar | FullCalendar / Custom Tailwind Grid | 🔴 Not Started | Visual post cards with channel badges |
| Weekly & Daily Views | Supported in `calendar.tsx` | Time-slot weekly & daily views | 🔴 Not Started | Drag-and-drop rescheduling |
| Filtering by Account / Platform | Filter sidebar & tags | Filter toolbar (account, state, tag) | 🔴 Not Started | Instant client-side & server-side filter |
| Queue Slots Management | Custom JSON posting schedule | Visual time-slot queue schedule | 🔴 Not Started | "Add to Next Available Slot" |
| Drag-and-Drop Rescheduling | HTML5 Drag and Drop | `@hello-pangea/dnd` or `@dnd-kit` | 🔴 Not Started | Atomic publish date update in backend |
| Timezone Awareness | Dayjs UTC + User Timezone | Dayjs UTC with explicit user TZ | 🔴 Not Started | Displays in local TZ, publishes in UTC |

---

## 6. Publishing Engine & Workflow Orchestration

| Feature / Capability | Postiz Reference | Saucer Target | Target Status | Technical Notes |
| :--- | :--- | :--- | :---: | :--- |
| Immediate Publishing | Dispatches Temporal workflow | Synchronous/Asynchronous worker | 🔴 Not Started | Executes immediately via worker |
| Scheduled Publishing | Temporal `sleep` until date | Temporal / Inngest scheduled job | 🔴 Not Started | Durable execution with heartbeat |
| Duplicate Publishing Prevention | Workflow lock + postId query | Idempotency keys + status guard | 🔴 Not Started | Never double-publish on failure |
| Automatic Token Refresh | `RefreshToken` ApplicationFailure | Pre-flight check & auto-refresh | 🔴 Not Started | Refreshes OAuth token before API call |
| Channel Concurrency Throttling | Provider-specific task queues | Dynamic rate limiters per queue | 🔴 Not Started | Adheres strictly to API limits |
| Recurring / Evergreen Posts | Repeat intervals in `Post` | Cron / Interval reschedule | 🔴 Not Started | Re-enqueues next post upon success |
| Failure Diagnostics & Error Logging | `Errors` table + in-app notice | Traceable error log + alerts | 🔴 Not Started | Detailed error reporting with recovery hints |
| Graceful Disconnect Handling | `Disconnect` exception | Channel auto-pause & alert | 🔴 Not Started | Notifies workspace admin to reconnect |

---

## 7. Saucer AI Content Studio

| Feature / Capability | Postiz Reference | Saucer Target | Target Status | Technical Notes |
| :--- | :--- | :--- | :---: | :--- |
| Caption Generation | OpenAI GPT-4 | Google Gemini 2.5 Flash / Pro | 🔴 Not Started | Structured output schemas via Zod |
| Post Idea Generator | OpenAI completion | Gemini 2.5 Pro Idea Brainstormer | 🔴 Not Started | Generates multi-angle content ideas |
| Viral Hook & Thread Creator | Custom prompts | Specialized Gemini Hook Prompts | 🔴 Not Started | Generates 5-10 post threads for X/Bluesky |
| Platform-Specific Adaptation | Manual prompts | Single prompt -> multi-channel | 🔴 Not Started | Adapts length, tone & formatting per network |
| Tone & Style Rewriter | CopilotKit rewrite | Interactive AI rewrite controls | 🔴 Not Started | Casual, Professional, Humorous, Bold |
| Hashtag Generator | Basic OpenAI completion | Gemini contextual hashtag engine | 🔴 Not Started | Niche, broad, and trending tags |
| Monthly AI Allowance Enforcement | Primitive credit count | Auditable Ledger + Atomic Lock | 🔴 Not Started | Server-side verification; never trusts UI |
| Safe Reservation / Settlement | None (deducts on finish) | 2-Phase Reservation / Commit | 🔴 Not Started | Prevents concurrent double-spend |
| AI Token & Cost Tracking | None | Token count & cost recorded | 🔴 Not Started | Stored in `AiCreditTransaction` |
| Video Clipping from YouTube | RunPod + Deepgram + OpenAI | Cloudflare Workers / Modal / RunPod | 🔴 Not Started | Phase 2 advanced capability |

---

## 8. Analytics & Performance Tracking

| Feature / Capability | Postiz Reference | Saucer Target | Target Status | Technical Notes |
| :--- | :--- | :--- | :---: | :--- |
| Cross-Platform Metrics Dashboard | Custom Charts (`chart.js`) | Recharts / Tremor interactive charts | 🔴 Not Started | Aggregates reach, engagement, impressions |
| Per-Post Performance Tracking | Single post analytics | Deep per-post stats & breakdown | 🔴 Not Started | Likes, comments, shares, retweets |
| Audience Growth Analytics | Follower trends | Historic follower chart | 🔴 Not Started | Polled daily via background jobs |
| Missing vs Zero Metric Precision | Often treated as 0 | Explicit `null` vs `0` distinction | 🔴 Not Started | Required to prevent false reporting |
| CSV / PDF Analytics Export | Basic export | Clean branded PDF/CSV export | 🔴 Not Started | Agency feature for client reports |

---

## 9. Automations & Integrations

| Feature / Capability | Postiz Reference | Saucer Target | Target Status | Technical Notes |
| :--- | :--- | :--- | :---: | :--- |
| RSS Feed Auto-Publishing | `AutoPost` model + workflow | RSS Poller + Post Generator | 🔴 Not Started | Automatically schedules new feed items |
| Webhook Notifications | Outgoing webhooks | HMAC-signed Webhook engine | 🔴 Not Started | Events: `post.published`, `post.failed`, etc. |
| Public REST API (v1) | Express / NestJS Swagger | OpenAPI / NestJS Swagger v1 | 🔴 Not Started | Scoped API keys with rate limits |
| Model Context Protocol (MCP) | Mastra MCP server | Official Saucer MCP Server | 🔴 Not Started | Enables AI agents (Cursor/Claude) to post |
| Zapier / Make Integration | Planned | REST API Webhook integration | 🔴 Not Started | Standardized payloads for Zapier/Make |

---

## 10. SaaS Subscriptions & Billing

| Feature / Capability | Postiz Reference | Saucer Target | Target Status | Technical Notes |
| :--- | :--- | :--- | :---: | :--- |
| Payment Gateway Integration | Stripe & RevenueCat | Dodo Payments Checkout Sessions | 🔴 Not Started | test_mode initially; live upon approval |
| Tier Plans (Free, Pro, Agency) | `pricing.ts` in NestJS | Configurable tier matrix | 🔴 Not Started | Dynamic entitlements stored in DB |
| Subscription Lifecycle Management | Stripe Webhooks | Dodo Payments Webhook listener | 🔴 Not Started | Handles active, renewed, updated, cancelled |
| Webhook Signature Verification | Stripe signature header | Standard Webhook cryptographic signature | 🔴 Not Started | Reject unverified webhook events |
| Feature Gating & Entitlements | CASL Ability checks | CASL Guards + Tier Middleware | 🔴 Not Started | Enforces channels, posts, AI credits |
| Self-Service Customer Billing | Stripe Billing Portal | Dodo Customer Portal Session | 🔴 Not Started | Dodo hosted customer portal / invoices |

