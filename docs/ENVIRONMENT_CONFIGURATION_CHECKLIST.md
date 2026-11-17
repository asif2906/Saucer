# SAUCER — ENVIRONMENT CONFIGURATION CHECKLIST

This checklist provides the definitive mapping of all environment variables used by Saucer in production.

> [!IMPORTANT]
> Configure these variables in **Vercel Dashboard → Project Settings → Environment Variables** (applied to Production, Preview, and Development).

---

## 1. ESSENTIAL INFRASTRUCTURE (REQUIRED FOR BASE OPERATION)

| Variable Name | Purpose | Required / Optional | Supplying Service | Tested Status |
| :--- | :--- | :---: | :--- | :---: |
| `NEXT_PUBLIC_SUPABASE_URL` | Connects frontend and SSR middleware to Supabase | **Required** | Supabase Project (`xfqapdxeladfvivlwltp`) | **Verified Working** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client API key for Supabase Auth | **Required** | Supabase Project (`xfqapdxeladfvivlwltp`) | **Verified Working** |
| `NEXT_PUBLIC_APP_URL` | Canonical application URL for redirects | **Required** | Vercel Deployment Domain | **Verified Working** |
| `ENCRYPTION_KEY` | AES-256-GCM secret key for encrypting OAuth tokens | **Required** | User-generated 32-char secret | **Verified Working** |
| `DATABASE_URL` | Direct connection for Prisma ORM | **Required for Prisma pooler** | Supabase Database Settings (Port 6543) | Documented below |
| `DIRECT_URL` | Direct connection for Prisma migrations | **Optional** | Supabase Database Settings (Port 5432) | Documented below |

---

## 2. ARTIFICIAL INTELLIGENCE (GEMINI FREE-TIER)

| Variable Name | Purpose | Required / Optional | Supplying Service | Tested Status |
| :--- | :--- | :---: | :--- | :---: |
| `GEMINI_API_KEY` | Powers Saucer AI Studio (captions, rewrite, hashtags, thread) | **Required for AI** | Google AI Studio (Free Tier) | **Verified Working** |
| `GEMINI_DEFAULT_MODEL` | Primary text model (defaults to `gemini-3.8-flash`) | Optional | Google Gemini API | **Verified Working** |
| `GEMINI_FALLBACK_MODEL` | Lightweight fallback (defaults to `gemini-3.5-flash-lite`) | Optional | Google Gemini API | **Verified Working** |
| `GEMINI_MAX_RPM` | Rate limit protection (defaults to `15`) | Optional | Google AI Studio limits | Configured |
| `GEMINI_MAX_TPM` | Token rate limit (defaults to `1000000`) | Optional | Google AI Studio limits | Configured |
| `GEMINI_MAX_RPD` | Daily request limit (defaults to `1500`) | Optional | Google AI Studio limits | Configured |

---

## 3. PAYMENTS & SUBSCRIPTIONS (DODO PAYMENTS)

| Variable Name | Purpose | Required / Optional | Supplying Service | Tested Status |
| :--- | :--- | :---: | :--- | :---: |
| `DODO_PAYMENTS_API_KEY` | Secret key for checkout sessions and customer portal | **Required for Billing** | Dodo Payments Dashboard | **Tested in test_mode** |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Webhook signature verification secret | **Required for Billing** | Dodo Payments Dashboard | **Tested in test_mode** |
| `DODO_PAYMENTS_ENVIRONMENT` | Environment toggle (`test_mode` or `live_mode`) | **Required for Billing** | Dodo Payments | Configured (`test_mode`) |
| `DODO_PAYMENTS_RETURN_URL` | Post-checkout redirect URL | Optional | Saucer Billing Settings | Configured |

---

## 4. SOCIAL MEDIA OAUTH INTEGRATIONS (OWNER CREDENTIALS NEEDED)

To enable live social channel connections in production, create developer apps on the respective platforms and provide:

### Meta (Instagram Business & Facebook Pages)
- `META_APP_ID`: From [Meta Developer Portal](https://developers.facebook.com/)
- `META_APP_SECRET`: From Meta Developer Portal App Settings → Basic
- Callback URL to authorize: `https://<your-vercel-domain>/api/social/oauth/facebook/callback` and `.../instagram/callback`

### LinkedIn (Profiles & Organization Pages)
- `LINKEDIN_CLIENT_ID`: From [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
- `LINKEDIN_CLIENT_SECRET`: From LinkedIn App → Auth tab
- Callback URL to authorize: `https://<your-vercel-domain>/api/social/oauth/linkedin/callback`

### Google (YouTube & YouTube Shorts)
- `GOOGLE_CLIENT_ID`: From [Google Cloud Console](https://console.cloud.google.com/) Credentials
- `GOOGLE_CLIENT_SECRET`: From Google Cloud Console Credentials
- Callback URL to authorize: `https://<your-vercel-domain>/api/social/oauth/youtube/callback`

### Pinterest (Pins & Boards)
- `PINTEREST_APP_ID`: From [Pinterest Developer Portal](https://developers.pinterest.com/)
- `PINTEREST_APP_SECRET`: From Pinterest Developer Portal
- Callback URL to authorize: `https://<your-vercel-domain>/api/social/oauth/pinterest/callback`
