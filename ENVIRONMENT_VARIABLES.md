# SAUCER — ENVIRONMENT VARIABLES SPECIFICATION

This document provides an exhaustive reference of all environment variables required across the Saucer frontend, backend API, orchestrator workers, and database services.

> [!CAUTION]
> Never commit actual secret keys, production database credentials, or API tokens to source control. Use `.env.example` with sanitized placeholders.

---

## 1. System Core & Routing Configuration

| Variable | Environment | Required | Description | Example / Default |
| :--- | :--- | :---: | :--- | :--- |
| `FRONTEND_URL` | API / Worker | **Yes** | Fully qualified public URL of the web dashboard | `https://app.saucer.tech` |
| `NEXT_PUBLIC_BACKEND_URL` | Frontend | **Yes** | Public-facing base URL of the Core API | `https://api.saucer.tech` |
| `BACKEND_INTERNAL_URL` | API / Worker | **Yes** | Internal network URL for container-to-container calls | `http://localhost:3000` |
| `JWT_SECRET` | API | **Yes** | Cryptographic secret used to sign session cookies | *32+ character random string* |
| `PORT` | API | No | Port on which the Core API listens | `3000` |
| `ORCHESTRATOR_PORT` | Worker | No | Port for orchestrator healthcheck controller | `3002` |
| `IS_GENERAL` | All | **Yes** | General deployment mode flag | `true` |
| `DISABLE_REGISTRATION` | API | No | Closes public self-service signups when `true` | `false` |

---

## 2. Database & Cache Infrastructure

| Variable | Environment | Required | Description | Example / Default |
| :--- | :--- | :---: | :--- | :--- |
| `DATABASE_URL` | API / Worker | **Yes** | Supabase Supavisor Transaction Pooler (Port 6543) | `postgresql://user:pwd@pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | API (Migrations)| **Yes** | Supabase Direct Session Connection (Port 5432) | `postgresql://user:pwd@db.supabase.com:5432/postgres` |
| `REDIS_URL` | API / Worker | **Yes** | Redis connection URI for rate limits & locks | `redis://default:token@regional-redis.upstash.io:6379` |

---

## 3. Workflow Orchestration (Temporal)

| Variable | Environment | Required | Description | Example / Default |
| :--- | :--- | :---: | :--- | :--- |
| `TEMPORAL_ADDRESS` | API / Worker | **Yes** | Host and port of the Temporal cluster | `localhost:7233` or `saucer.tmprl.cloud:7233` |
| `TEMPORAL_NAMESPACE` | API / Worker | **Yes** | Temporal namespace partition | `default` or `saucer-production` |
| `TEMPORAL_API_KEY` | API / Worker | Optional | Temporal Cloud API key (if using managed cloud)| *Secret key* |
| `TEMPORAL_TLS` | API / Worker | Optional | Set to `true` when connecting over mTLS / TLS | `true` |
| `WORKER_CONCURRENCY_DIVIDER`| Worker | No | Divides per-provider concurrency across server fleet | `1` |
| `EXCLUDE_QUEUE` | Worker | No | Comma-separated list of queues excluded from node| `reddit,x` |

---

## 4. Object Storage (Cloudflare R2 / Supabase Storage)

| Variable | Environment | Required | Description | Example / Default |
| :--- | :--- | :---: | :--- | :--- |
| `STORAGE_PROVIDER` | API / Worker | **Yes** | Storage adapter backend (`cloudflare` or `local`)| `cloudflare` |
| `CLOUDFLARE_ACCOUNT_ID` | API / Worker | **Yes** | Cloudflare dashboard account identifier | `8f9b2a1c0d4e...` |
| `CLOUDFLARE_ACCESS_KEY` | API / Worker | **Yes** | R2 API token access key ID | `7d8e9f...` |
| `CLOUDFLARE_SECRET_ACCESS_KEY`| API / Worker| **Yes** | R2 API token secret access key | *Secret string* |
| `CLOUDFLARE_BUCKETNAME` | API / Worker | **Yes** | Name of the primary media bucket | `saucer-media-prod` |
| `CLOUDFLARE_BUCKET_URL` | API / Worker | **Yes** | Public CDN endpoint for stored assets | `https://assets.saucer.tech/` |
| `CLOUDFLARE_REGION` | API / Worker | No | Storage region | `auto` |

---

## 5. Artificial Intelligence (Google Gemini)

| Variable | Environment | Required | Description | Example / Default |
| :--- | :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | API | **Yes** | Central corporate Google Cloud Gemini API key | `AIzaSy...` |
| `DEFAULT_GEMINI_MODEL` | API | No | Primary model for standard text generation | `gemini-2.5-flash` |
| `REASONING_GEMINI_MODEL` | API | No | Primary model for deep reasoning / threads | `gemini-2.5-pro` |

---

## 6. Subscriptions & Billing (Dodo Payments — Server-Side Only)

> [!CAUTION]
> Never expose Dodo Payments secret keys or webhook keys to the frontend. All checkout session creation and webhook verification occurs strictly server-side.

| Variable | Environment | Required | Description | Example / Default |
| :--- | :--- | :---: | :--- | :--- |
| `DODO_PAYMENTS_API_KEY` | API | **Yes** | Server-side API key for Dodo Payments SDK | `dodo_sk_...` |
| `DODO_PAYMENTS_WEBHOOK_KEY` | API | **Yes** | Secret key for verifying Dodo webhook signatures | `whsec_...` |
| `DODO_PAYMENTS_ENVIRONMENT` | API | **Yes** | Operational environment (`test_mode` or `live_mode`)| `test_mode` |
| `DODO_PAYMENTS_RETURN_URL` | API | **Yes** | Customer redirect URL after checkout completion | `https://app.saucer.tech/billing/return` |

---

## 7. Security & Encryption

| Variable | Environment | Required | Description | Example / Default |
| :--- | :--- | :---: | :--- | :--- |
| `ENCRYPTION_PROVIDER` | API / Worker | **Yes** | OAuth token encryption mode (`local` or `aws-kms`)| `local` |
| `ENCRYPTION_KEY` | API / Worker | **Yes** | Base64-encoded 256-bit encryption key (`openssl rand -base64 32`) | *32-byte Base64 key* |
| `DISABLE_SSRF_PROTECTION` | API / Worker | No | Set to `false` in production (prevents SSRF) | `false` |
| `API_LIMIT` | API | No | Public API default requests per hour limit | `1000` |

---

## 8. Transactional Email

| Variable | Environment | Required | Description | Example / Default |
| :--- | :--- | :---: | :--- | :--- |
| `EMAIL_PROVIDER` | API / Worker | **Yes** | Transactional provider (`resend` or `ses`) | `resend` |
| `RESEND_API_KEY` | API / Worker | Optional | Resend API key for verification & alerts | `re_...` |
| `EMAIL_FROM_ADDRESS` | API / Worker | **Yes** | Verified sender email address | `notifications@saucer.tech` |
| `EMAIL_FROM_NAME` | API / Worker | **Yes** | Sender display name | `Saucer` |

---

## 9. Social Media Platform Developer Credentials

| Variable | Target Platform | Description |
| :--- | :--- | :--- |
| `X_API_KEY` / `X_API_SECRET` | X (Twitter) | OAuth 2.0 Client ID and Secret (Twitter Developer Portal) |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | LinkedIn | LinkedIn Developer App Client ID and Secret |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Meta (FB & IG) | Meta Business Developer App ID and Secret |
| `THREADS_APP_ID` / `THREADS_APP_SECRET` | Threads | Threads API App ID and Secret |
| `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET` | YouTube | Google Cloud Console OAuth 2.0 Web Client |
| `TIKTOK_CLIENT_ID` / `TIKTOK_CLIENT_SECRET` | TikTok | TikTok Developer Login Kit Credentials |
| `TIKTOK_BUSINESS_CLIENT_ID` / `TIKTOK_BUSINESS_CLIENT_SECRET`| TikTok Business| TikTok Commercial Marketing Developer Credentials |
| `PINTEREST_CLIENT_ID` / `PINTEREST_CLIENT_SECRET` | Pinterest | Pinterest Business App ID and Secret |
| `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` | Reddit | Reddit Script / Web App Client ID and Secret |
| `DISCORD_CLIENT_ID` / `DISCORD_BOT_TOKEN_ID` | Discord | Discord Developer Portal Bot & App Credentials |
| `SLACK_ID` / `SLACK_SECRET` / `SLACK_SIGNING_SECRET` | Slack | Slack App Manifest Credentials |
| `MASTODON_CLIENT_ID` / `MASTODON_CLIENT_SECRET` | Mastodon | Default Mastodon instance client credentials |

