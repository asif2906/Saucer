# SAUCER — PRODUCTION ENVIRONMENT CONFIGURATION AUDIT
**Project:** Saucer Critical Production Stabilization  
**Branch:** `fix/production-stabilization`  
**Date:** November 17, 2026  
**Status:** Audit Completed

---

## 1. Overview
This document provides the definitive mapping of all environment variables referenced throughout the Saucer codebase. It identifies exact purposes, source references, required Vercel hosting scopes (Production, Preview, Development), current configuration status, and dependent feature sets.

> [!CAUTION]
> In accordance with security standards, literal credential values and private secrets are never committed to Git, printed in logs, or exposed to frontend components.

---

## 2. Environment Variables Mapping & Audit

| Variable Name | Required / Optional | Required Environment | Referenced Files | Feature Dependency | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | **Required** | Production, Preview, Development | `src/lib/social/oauth.service.ts`, `src/lib/supabase/middleware.ts` | Base domain for OAuth redirects & session redirects | Configured |
| `NEXT_PUBLIC_SUPABASE_URL` | **Required** | Production, Preview, Development | `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts` | Supabase Auth API & PostgreSQL REST endpoint | **Action Required in Vercel** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Required** | Production, Preview, Development | `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts` | Client-side Supabase anonymous public token | **Action Required in Vercel** |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional / Admin | Production, Preview | `src/lib/supabase/admin.ts` | Privileged background operations | Configured |
| `DATABASE_URL` | Recommended | Production, Preview, Development | `prisma/schema.prisma`, `src/lib/prisma.ts` | Direct Prisma PostgreSQL pooled connection string | Optional (RLS fallback active) |
| `DIRECT_URL` | Optional | Production, Preview | `prisma/schema.prisma` | Direct non-pooled PostgreSQL URL for schema migrations | Optional |
| `GEMINI_API_KEY` | **Required** | Production, Preview, Development | `src/lib/ai/providers/gemini.provider.ts` | Google Gemini AI Studio Studio engine | Configured |
| `GEMINI_DEFAULT_MODEL` | Optional (default: `gemini-3.5-flash-lite`) | Production, Preview, Development | `src/lib/ai/model-router.ts` | Primary AI model router target | Configured |
| `GEMINI_FALLBACK_MODEL` | Optional (default: `gemini-3.8-flash`) | Production, Preview, Development | `src/lib/ai/model-router.ts` | Secondary fallback model router target | Configured |
| `GEMINI_MAX_RPM` | Optional (default: 15) | Production, Preview, Development | `src/lib/ai/quota-controller.ts` | Free-tier requests per minute threshold | Configured (15) |
| `GEMINI_MAX_TPM` | Optional (default: 1M) | Production, Preview, Development | `src/lib/ai/quota-controller.ts` | Free-tier tokens per minute threshold | Configured (1,000,000) |
| `GEMINI_MAX_RPD` | Optional (default: 1500) | Production, Preview, Development | `src/lib/ai/quota-controller.ts` | Free-tier daily requests limit | Configured (1500) |
| `GEMINI_MAX_CONCURRENT` | Optional (default: 5) | Production, Preview, Development | `src/lib/ai/quota-controller.ts` | Global concurrency lock | Configured (5) |
| `AI_ADMIN_KILL_SWITCH` | Optional (default: false) | Production, Preview, Development | `src/lib/ai/quota-controller.ts` | Immediate emergency shutdown of AI routes | Configured (false) |
| `TOKEN_ENCRYPTION_SECRET` | **Required** | Production, Preview, Development | `src/lib/social/token-encryption.service.ts` | AES-256-GCM encryption for stored OAuth access/refresh tokens | Configured |
| `META_APP_ID` | Required for Meta | Production, Preview | `src/lib/social/providers/facebook.provider.ts`, `instagram.provider.ts` | Instagram & Facebook OAuth integration | Required per provider |
| `META_APP_SECRET` | Required for Meta | Production, Preview | `src/lib/social/providers/facebook.provider.ts`, `instagram.provider.ts` | Instagram & Facebook OAuth integration | Required per provider |
| `LINKEDIN_CLIENT_ID` | Required for LinkedIn | Production, Preview | `src/lib/social/providers/linkedin.provider.ts` | LinkedIn Profile & Page publishing | Required per provider |
| `LINKEDIN_CLIENT_SECRET` | Required for LinkedIn | Production, Preview | `src/lib/social/providers/linkedin.provider.ts` | LinkedIn Profile & Page publishing | Required per provider |
| `GOOGLE_CLIENT_ID` | Required for YouTube | Production, Preview | `src/lib/social/providers/youtube.provider.ts` | YouTube Data API video uploads & analytics | Required per provider |
| `GOOGLE_CLIENT_SECRET` | Required for YouTube | Production, Preview | `src/lib/social/providers/youtube.provider.ts` | YouTube Data API video uploads & analytics | Required per provider |
| `PINTEREST_APP_ID` | Required for Pinterest | Production, Preview | `src/lib/social/providers/pinterest.provider.ts` | Pinterest pin creation | Required per provider |
| `PINTEREST_APP_SECRET` | Required for Pinterest | Production, Preview | `src/lib/social/providers/pinterest.provider.ts` | Pinterest pin creation | Required per provider |
| `DODO_PAYMENTS_API_KEY` | Required for Dodo | Production, Preview | `src/lib/billing/dodo.service.ts` | Dodo Checkout and subscription management | Configured (Test Mode) |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Required for Dodo | Production, Preview | `src/app/api/billing/dodo/webhook/route.ts` | Webhook signature verification | Configured (Test Mode) |
| `DODO_PAYMENTS_ENVIRONMENT` | Optional (default: `test_mode`) | Production, Preview, Development | `src/lib/billing/dodo.service.ts` | Mode switch (`test_mode` vs `live_mode`) | Configured (`test_mode`) |
| `DODO_PAYMENTS_RETURN_URL` | Optional | Production, Preview, Development | `src/lib/billing/dodo.service.ts` | User return redirect post-checkout | Configured |

---

## 3. High-Priority Vercel Configuration Action Items

1. **Supabase Public Environment Variables**:
   As diagnosed in deployment screenshots, client registration requires:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xfqapdxeladfvivlwltp.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
   ```
   Add both variables to **Vercel Project Settings → Environment Variables** for **Production** and **Preview**.

2. **Next.js Base URL**:
   Ensure `NEXT_PUBLIC_APP_URL` points to your deployment domain:
   - For Production: `https://saucer.domain.com` (or your custom domain)
   - For Preview: In Vercel, can use `https://${process.env.VERCEL_URL}` or set custom domain preview URL.

3. **Social OAuth Callbacks**:
   In each developer console (Meta, LinkedIn, Google Cloud, Pinterest), configure authorized redirect URIs:
   - Meta: `https://<YOUR_DOMAIN>/api/social/oauth/facebook/callback` & `.../instagram/callback`
   - LinkedIn: `https://<YOUR_DOMAIN>/api/social/oauth/linkedin/callback`
   - Google: `https://<YOUR_DOMAIN>/api/social/oauth/youtube/callback`
   - Pinterest: `https://<YOUR_DOMAIN>/api/social/oauth/pinterest/callback`
