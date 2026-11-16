# SAUCER — REST API CATALOG & DEVELOPER SPECIFICATION

This document provides the complete API specification for **Saucer**, covering both internal dashboard routes and the external developer **Public API v1**.

---

## 1. API Architecture & Standards

- **Base URL (Internal Dashboard API)**: `https://api.saucer.tech/api/v1` (or `http://localhost:3000/api/v1` in development).
- **Base URL (Developer Public API)**: `https://api.saucer.tech/public/v1`.
- **Response Format**: All responses return JSON with standard HTTP status codes.
- **Authentication Schemes**:
  - **Internal Dashboard**: Secure, HTTP-only, SameSite `auth` cookie (JWT).
  - **Public API v1**: HTTP Header `Authorization: Bearer <saucer_api_key>` or `X-API-Key: <saucer_api_key>`.
- **Rate Limiting**:
  - Internal API: Throttled by client IP and user context (Redis-backed Throttler).
  - Public API: Tiered limits (Default: 30 requests/minute, burstable to 1,000/hour for Agency plans).

---

## 2. Authentication & Workspace Routes (`/api/v1/auth`, `/api/v1/users`)

### 2.1 Register New Account
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "sarah@acmeagency.com",
  "password": "SecurePassword123!",
  "name": "Sarah",
  "provider": "LOCAL",
  "orgName": "Acme Agency"
}
```
- **Response (200 OK)**:
```json
{
  "status": "success",
  "activate": false,
  "user": {
    "id": "usr_99f3c1a8",
    "email": "sarah@acmeagency.com",
    "name": "Sarah",
    "organization": {
      "id": "org_48a12d90",
      "name": "Acme Agency",
      "role": "ADMIN"
    }
  }
}
```
- **Cookie Set**: `auth=<jwt>; HttpOnly; Secure; SameSite=None; Path=/; Domain=.saucer.tech`

### 2.2 User Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "sarah@acmeagency.com",
  "password": "SecurePassword123!",
  "provider": "LOCAL"
}
```
- **Response (200 OK)**: Sets authenticated cookie and returns user session profile.

### 2.3 Switch Active Workspace
- **Endpoint**: `POST /users/change-org`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "organizationId": "org_77b31c94"
}
```
- **Response (200 OK)**: Sets updated `org` cookie and returns organization metadata.

---

## 3. Social Media Account Management (`/api/v1/integrations`)

### 3.1 List Connected Social Accounts
- **Endpoint**: `GET /integrations`
- **Access**: Authenticated (Workspace Member)
- **Response (200 OK)**:
```json
[
  {
    "id": "clx_001",
    "name": "Acme Tech",
    "providerIdentifier": "x",
    "picture": "https://pbs.twimg.com/profile_images/acme.jpg",
    "disabled": false,
    "refreshNeeded": false,
    "postingTimes": [{"time": 540}, {"time": 840}]
  },
  {
    "id": "clx_002",
    "name": "Acme Corporation",
    "providerIdentifier": "linkedin-page",
    "picture": "https://media.licdn.com/dms/image/acme.jpg",
    "disabled": false,
    "refreshNeeded": false
  }
]
```

### 3.2 Initiate Social OAuth Flow
- **Endpoint**: `GET /integrations/social/:provider`
- **Access**: Authenticated (Workspace Admin)
- **Parameters**: `provider` (e.g., `x`, `linkedin`, `instagram`, `facebook`, `youtube`, `threads`)
- **Response (200 OK)**:
```json
{
  "url": "https://twitter.com/i/oauth2/authorize?response_type=code&client_id=...&redirect_uri=..."
}
```

### 3.3 Disconnect Social Channel
- **Endpoint**: `DELETE /integrations/:id`
- **Access**: Authenticated (Workspace Admin)
- **Response (200 OK)**: `{ "success": true }`

---

## 4. Post Composer & Publishing Engine (`/api/v1/posts`)

### 4.1 Create or Schedule Post
- **Endpoint**: `POST /posts`
- **Access**: Authenticated (Workspace Member)
- **Policy Check**: `[Create, Sections.POSTS_PER_MONTH]`
- **Request Body**:
```json
{
  "type": "schedule",
  "date": "2026-11-20T14:30:00Z",
  "shortLink": true,
  "tags": ["product", "ai"],
  "posts": [
    {
      "integration": { "id": "clx_001" },
      "settings": {
        "__type": "x",
        "title": ""
      },
      "value": [
        {
          "id": "",
          "content": "Excited to introduce Saucer AI! 🚀 Launching our new automation suite.",
          "delay": 0,
          "image": [
            { "id": "med_101", "path": "uploads/banner.png" }
          ]
        },
        {
          "id": "",
          "content": "Check out the full breakdown in our docs: https://saucer.tech",
          "delay": 2
        }
      ]
    },
    {
      "integration": { "id": "clx_002" },
      "settings": {
        "__type": "linkedin-page",
        "title": ""
      },
      "value": [
        {
          "id": "",
          "content": "We are proud to announce the official launch of Saucer AI. Empowering content teams worldwide.",
          "image": [
            { "id": "med_101", "path": "uploads/banner.png" }
          ]
        }
      ]
    }
  ]
}
```
- **Response (201 Created)**: Returns created post cluster with generated post IDs and group UUID.

### 4.2 Query Calendar Range
- **Endpoint**: `GET /posts`
- **Access**: Authenticated
- **Query Parameters**:
  - `startDate`: ISO 8601 string (`2026-11-01T00:00:00Z`)
  - `endDate`: ISO 8601 string (`2026-11-30T23:59:59Z`)
  - `integrations`: Comma-separated integration IDs (optional)
  - `state`: Filter by `QUEUE`, `DRAFT`, `PUBLISHED`, `ERROR`
- **Response (200 OK)**: Array of scheduled and published post records.

### 4.3 Update Post Publish Date (Drag-and-Drop)
- **Endpoint**: `POST /posts/:id/change-date`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "date": "2026-11-22T10:00:00Z",
  "action": "schedule"
}
```
- **Response (200 OK)**: Updates database record and dispatches new Temporal workflow with updated timer.

---

## 5. Saucer AI Content Engine (`/api/ai/*`)

All AI endpoints execute server-side using Google Gemini free-tier models (`gemini-3.8-flash` primary, `gemini-3.5-flash-lite` fallback). Every request validates user auth, checks global quota, atomically reserves credits, calls Gemini, validates response structure with Zod, and settles credits on success (or releases on failure).

### 5.1 Generate Quick Caption
- **Endpoint**: `POST /api/ai/caption`
- **Cost**: 1 credit
- **Request Body**:
```json
{
  "topic": "Announcing our new AI scheduling feature",
  "platform": "linkedin",
  "tone": "professional",
  "includeHashtags": true,
  "includeEmojis": true
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "caption": "Managing multi-channel social distribution requires speed and precision...",
    "hashtags": ["#SocialMediaSaaS", "#MarketingAutomation", "#AgencyGrowth"],
    "emojis": ["🚀", "📈", "💡"],
    "characterCount": 384
  },
  "modelUsed": "gemini-3.5-flash-lite",
  "creditsDeducted": 1,
  "balance": {
    "available": 49,
    "monthlyAllowance": 50,
    "monthlyUsed": 1,
    "reserved": 0,
    "purchased": 0
  }
}
```

### 5.2 Generate Hashtags and Emojis
- **Endpoint**: `POST /api/ai/hashtags`
- **Cost**: 1 credit
- **Request Body**:
```json
{
  "content": "Launching our new SaaS product today! Let us know what you think.",
  "platform": "twitter",
  "count": 5
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "hashtags": ["#SaaS", "#ProductLaunch", "#TechStartup", "#IndieHacker", "#BuildInPublic"],
    "emojis": ["🚀", "🎉", "🔥"]
  },
  "creditsDeducted": 1
}
```

### 5.3 Tone Rewriter
- **Endpoint**: `POST /api/ai/rewrite`
- **Cost**: 1 credit
- **Request Body**:
```json
{
  "content": "Our software has new updates and it is faster now.",
  "tone": "bold",
  "targetLength": "same"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "rewritten": "We didn't just update the platform — we engineered it for unmatched velocity.",
    "tone": "bold",
    "notes": "Sharpened vocabulary and active framing."
  },
  "creditsDeducted": 1
}
```

### 5.4 Multi-Platform Content Adaptation
- **Endpoint**: `POST /api/ai/adapt`
- **Cost**: 2 credits
- **Request Body**:
```json
{
  "sourceContent": "We raised a seed round to build the future of social automation.",
  "sourcePlatform": "linkedin",
  "targetPlatforms": ["twitter", "linkedin", "instagram"]
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "adaptations": [
      {
        "platform": "twitter",
        "content": "Excited to share we just closed our seed round to build the future of social automation! 🚀",
        "characterCount": 94,
        "hashtags": ["#seedround", "#buildinpublic"]
      },
      {
        "platform": "linkedin",
        "content": "Today marks an exciting milestone: we've closed our seed round to accelerate the future of social automation...",
        "characterCount": 350,
        "hashtags": ["#VentureCapital", "#StartupFunding", "#Automation"]
      }
    ]
  },
  "creditsDeducted": 2
}
```

### 5.5 Viral Thread Generation
- **Endpoint**: `POST /api/ai/thread`
- **Cost**: 3 credits
- **Request Body**:
```json
{
  "topic": "7 mental models every founder needs in 2026",
  "postCount": 7,
  "platform": "twitter",
  "hookStyle": "contrarian"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "hook": "95% of founders make decisions using intuition instead of mental models. Here are 7 frameworks:",
    "posts": [
      { "postNumber": 1, "content": "1. Inversion...", "characterCount": 180 },
      { "postNumber": 2, "content": "2. Second-Order Thinking...", "characterCount": 210 }
    ],
    "callToAction": "If you found this valuable, retweet the first post and follow for more.",
    "totalPosts": 7
  },
  "creditsDeducted": 3
}
```

### 5.6 Image-to-Caption Vision Analysis
- **Endpoint**: `POST /api/ai/vision`
- **Cost**: 2 credits
- **Request Body**:
```json
{
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "mimeType": "image/png",
  "platform": "instagram",
  "tone": "casual"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "description": "Minimalist red square emblem with crisp margins.",
    "suggestedCaptions": [
      "Simplicity speaks louder than noise. ✨",
      "Less is more. What's your creative philosophy?"
    ],
    "altText": "A solid red square graphic on a clean white background.",
    "suggestedHashtags": ["#minimalism", "#designinspo", "#creative"]
  },
  "creditsDeducted": 2
}
```

### 5.7 7-Day Content Calendar Ideation
- **Endpoint**: `POST /api/ai/calendar`
- **Cost**: 5 credits
- **Request Body**:
```json
{
  "niche": "B2B SaaS Growth Marketing",
  "targetAudience": "Early-stage startup founders and growth leads",
  "pillars": ["Product Tips", "Customer Stories", "Industry Insights"]
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "overview": "7-day thought leadership campaign emphasizing tactical insights and founder transparency.",
    "days": [
      {
        "day": 1,
        "theme": "Monday Motivation & Industry Metric",
        "postIdea": "Share one surprising SaaS churn statistic and how to counter it.",
        "suggestedPlatform": "linkedin",
        "bestTime": "08:30 AM"
      }
    ]
  },
  "creditsDeducted": 5
}
```

### 5.8 Query AI Credits Balance
- **Endpoint**: `GET /api/ai/credits`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
{
  "success": true,
  "balance": {
    "available": 49,
    "monthlyAllowance": 50,
    "monthlyUsed": 1,
    "reserved": 0,
    "purchased": 0,
    "billingPeriodEnd": "2026-12-16T21:49:00.000Z"
  }
}
```

### 5.9 Query AI Ledger & Audit Usage History
- **Endpoint**: `GET /api/ai/usage`
- **Access**: Authenticated
- **Response (200 OK)**:
```json
{
  "success": true,
  "usage": [
    {
      "id": "led_3389028",
      "entryType": "USAGE_SETTLEMENT",
      "feature": "caption",
      "model": "gemini-3.5-flash-lite",
      "amount": 1,
      "inputTokens": 142,
      "outputTokens": 86,
      "createdAt": "2026-11-16T22:15:30.000Z"
    }
  ]
}
```

---

## 6. Subscriptions & Billing (`/api/v1/billing`)

### 6.1 Create Dodo Payments Checkout Session
- **Endpoint**: `POST /billing/checkout-session`
- **Access**: Authenticated (Workspace Admin)
- **Request Body**:
```json
{
  "tier": "PRO",
  "period": "MONTHLY"
}
```
- **Response (200 OK)**:
```json
{
  "checkoutSessionId": "cks_99f3c1a8dodo",
  "checkoutUrl": "https://checkout.dodopayments.com/buy/cks_99f3c1a8dodo"
}
```

### 6.2 Create Dodo Customer Portal Session
- **Endpoint**: `POST /billing/customer-portal`
- **Access**: Authenticated (Workspace Admin)
- **Response (200 OK)**:
```json
{
  "portalUrl": "https://customer.dodopayments.com/portal/ps_88b2a1"
}
```

### 6.3 Dodo Payments Webhook Ingress
- **Endpoint**: `POST /billing/dodo/webhook`
- **Access**: Public (Authenticated via standard webhook cryptographic signatures)
- **Events Handled**:
  - `subscription.active`
  - `subscription.renewed`
  - `subscription.updated`
  - `subscription.cancelled`
  - `subscription.failed`
  - `payment.succeeded`
  - `payment.failed`
  - `refund.succeeded`
- **Response (200 OK)**: `{ "status": "success" }`

---

## 7. Developer Public API v1 (`/public/v1`)

### 7.1 Create Post (Headless / Agent API)
- **Endpoint**: `POST /public/v1/posts`
- **Headers**: `Authorization: Bearer <saucer_api_key>`
- **Request Body**:
```json
{
  "publishDate": "2026-11-25T16:00:00Z",
  "posts": [
    {
      "channel": "x",
      "content": "Automated broadcast via Saucer Public API! #buildinpublic"
    }
  ]
}
```
- **Response (201 Created)**: Returns post identifier, scheduled timestamp, and tracking URL.

