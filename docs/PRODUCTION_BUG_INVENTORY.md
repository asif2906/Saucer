# SAUCER — PRODUCTION BUG INVENTORY
**Project:** Saucer Critical Production Stabilization  
**Branch:** `fix/production-stabilization`  
**Date:** November 17, 2026  
**Status:** Audit & Remediation Complete

---

## Executive Summary
This document provides a comprehensive inventory of all production defects identified, investigated, and remediated during the stabilization phase. Each issue is cataloged with exact root causes, code locations, severity classifications, and end-to-end verification procedures.

---

## Bug Catalog

### BUG-001: Demo Account Substitution Post-Registration
- **Bug ID:** `BUG-001`
- **Affected Feature:** User Authentication, Onboarding, and Session Resolution
- **Severity:** `P0 — Critical` (Identity isolation & data leakage hazard)
- **User-Visible Symptoms:** A user registers a new account (e.g. `jakethedog29066@gmail.com`), logs in with valid credentials, but lands on a dashboard displaying hardcoded demo user data (`Sarah Connor`, `sarah@acme.com`, `Acme Media Orbit`).
- **Steps to Reproduce:**
  1. Open `/signup` and register a new account.
  2. Navigate to `/login` and submit valid credentials.
  3. Observe dashboard header, avatar, and workspace dropdown.
- **Actual Error:** Static hardcoded demonstration identity displayed in `/app/layout.tsx` and `app-header.tsx`.
- **Root Cause:** While Supabase Auth registration and database onboarding succeeded, frontend dashboard components (`app-header.tsx`, `app/page.tsx`, `workspace-switcher.tsx`) were hardcoded to static user state (`Sarah Connor`) instead of consuming authenticated user profile data from Supabase/Prisma.
- **Relevant Source Files:**
  - `src/components/app-header.tsx`
  - `src/app/app/layout.tsx`
  - `src/components/workspace-switcher.tsx`
  - `src/app/(auth)/login/page.tsx`
- **Required Fix:**
  1. Implemented `UserContext` and `useUser()` hook in `src/contexts/user-context.tsx`.
  2. Created `/api/me` route with live Supabase session and database profile lookup.
  3. Replaced static text and avatar with real authenticated user full name, email, and dynamic initials.
  4. Removed silent demo redirect bypasses from `/login`.
- **Verification Procedure:** Verified end-to-end; authenticated session loads dynamic profile and correctly signs out via Supabase client.

---

### BUG-002: Client Registration "Failed to fetch" in Deployed Vercel Environment
- **Bug ID:** `BUG-002`
- **Affected Feature:** Supabase Client-Side Registration & Authentication
- **Severity:** `P0 — Critical` (Blocks customer onboarding in production)
- **User-Visible Symptoms:** Clicking "Start Free Trial" on `/signup` throws an immediate red toast error: `Failed to fetch`.
- **Steps to Reproduce:**
  1. Deploy application to Vercel without configuring environment variables.
  2. Open production signup page.
  3. Fill out Full Name, Org Name, Work Email, and Password.
  4. Click "Start Free Trial".
- **Actual Error:** `Failed to fetch` due to `undefined/auth/v1/signup`.
- **Root Cause:** Next.js client-side variables prefixed with `NEXT_PUBLIC_` (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) were missing from Vercel Project Settings. The Supabase browser client initialized with `undefined` endpoints.
- **Relevant Source Files:**
  - `src/lib/supabase/client.ts`
  - `src/app/(auth)/signup/page.tsx`
- **Required Fix:** Documented and verified required Vercel environment variables in `docs/PRODUCTION_ENV_AUDIT.md`. Added explicit UI error guard checking client-side environment variable initialization.
- **Verification Procedure:** Verified local and preview builds initialize client Supabase instance cleanly when variables are injected.

---

### BUG-003: Social Media OAuth Mock Credentials Rejection
- **Bug ID:** `BUG-003`
- **Affected Feature:** Social Media Account Integrations (Meta, LinkedIn, YouTube, Pinterest)
- **Severity:** `P1 — Major` (All social account connections fail)
- **User-Visible Symptoms:** Clicking "Connect" on Instagram, Facebook, LinkedIn, YouTube, or Pinterest redirects to external provider errors (`Invalid Client ID`, `App Not Active`, `400 Bad Request`).
- **Steps to Reproduce:**
  1. Navigate to `/app/social-accounts`.
  2. Click "Connect" on any social network.
  3. Provider displays error screen or app crash.
- **Actual Error:** External OAuth authorization failure due to hardcoded mock fallback client IDs (`meta_app_mock_id`, `linkedin_mock_client_id`, etc.).
- **Root Cause:** Social providers had fallback default mock credentials embedded in provider source code instead of strictly validating production environment credentials. When production keys were absent, the mock strings were transmitted to real OAuth servers.
- **Relevant Source Files:**
  - `src/lib/social/providers/facebook.provider.ts`
  - `src/lib/social/providers/instagram.provider.ts`
  - `src/lib/social/providers/linkedin.provider.ts`
  - `src/lib/social/providers/youtube.provider.ts`
  - `src/lib/social/providers/pinterest.provider.ts`
- **Required Fix:** Removed all fake credentials and mock profile callbacks. Implemented strict configuration validation returning clear, safe user-facing diagnostic messages (`Provider OAuth is not configured on the server`).
- **Verification Procedure:** Attempting connection without credentials safely displays configuration guidance; providing credentials initiates authentic OAuth authorization flow.

---

### BUG-004: Post Composer Draft Persistence and Missing Channel Lock
- **Bug ID:** `BUG-004`
- **Affected Feature:** Post Composer, Draft Management, and Queue Persistence
- **Severity:** `P1 — Major` (Content creation and draft editing blocked)
- **User-Visible Symptoms:** Saving a draft failed with `At least one social platform variant must be selected` when the user had not yet selected social accounts. Existing drafts could not be loaded into `/app/create` for editing or deleting.
- **Steps to Reproduce:**
  1. Open `/app/create`.
  2. Type draft content without selecting a social account.
  3. Click "Save Draft".
  4. Error thrown: `Content and at least one target channel variant are required`.
- **Actual Error:** Backend validation in `POST /api/publishing/posts` required `variants.length > 0` even when `publishNow` and `scheduledAt` were null (draft state).
- **Root Cause:**
  1. API and Service schemas enforced variant selection for drafts.
  2. `/app/create` lacked `useSearchParams` draft loading logic (`/app/create?id=xxx`).
- **Relevant Source Files:**
  - `src/app/api/publishing/posts/route.ts`
  - `src/lib/publishing/publishing.service.ts`
  - `src/app/app/create/page.tsx`
  - `src/app/app/queue/page.tsx`
  - `src/app/app/calendar/page.tsx`
- **Required Fix:**
  1. Updated API and service validation to allow 0 variants for draft saves.
  2. Added `useSearchParams` hook, loading effect, and `PATCH`/`DELETE` handlers in `/app/create`.
  3. Added "Edit" and "Cancel/Delete" actions in `/app/queue` and `/app/calendar`.
- **Verification Procedure:** Draft saves with master content alone; editing loads existing post content and updates database seamlessly.

---

### BUG-005: AI Studio Engine Crash When DATABASE_URL Is Unset
- **Bug ID:** `BUG-005`
- **Affected Feature:** Saucer AI Studio (Captions, Hashtags, Rewrite, Adapt, Threads, Calendar)
- **Severity:** `P1 — Major` (AI Studio unavailable without direct database pooler)
- **User-Visible Symptoms:** Using any AI feature throws `Environment variable not found: DATABASE_URL` or internal server error 500.
- **Steps to Reproduce:**
  1. Run AI endpoints in an environment where direct Prisma Postgres pooler is unconfigured.
  2. Request caption or hashtag generation.
  3. Request fails with `PrismaClientInitializationError`.
- **Actual Error:** `PrismaClientInitializationError: error: Environment variable not found: DATABASE_URL`.
- **Root Cause:** `CreditService.reserveCredits` and `GlobalQuotaController.reserveQuota` executed raw `prisma.$transaction` calls without try/catch or in-memory fallback, crashing generation before calling the Google Gemini API.
- **Relevant Source Files:**
  - `src/lib/credits/credit.service.ts`
  - `src/lib/ai/quota-controller.ts`
- **Required Fix:**
  1. Added in-memory rate limiting and concurrency tracking to `GlobalQuotaController`.
  2. Added resilient reservation and settlement fallbacks to `CreditService`.
- **Verification Procedure:** Verified full lifecycle test runs cleanly even in standalone preview environments without throwing Prisma errors.

---

### BUG-006: Gemini Free-Tier 503 Spike Intermittent Failures
- **Bug ID:** `BUG-006`
- **Affected Feature:** Gemini Provider AI Content Generation
- **Severity:** `P2 — Moderate` (Intermittent API failure on high-demand spikes)
- **User-Visible Symptoms:** AI generation requests intermittently fail with Google API 503 error: `This model is currently experiencing high demand. Spikes in demand are usually temporary.`
- **Steps to Reproduce:**
  1. Send batch or successive generation requests on Gemini Free-Tier key.
  2. Google API returns 503 UNAVAILABLE.
- **Actual Error:** `{"error":{"code":503,"message":"This model is currently experiencing high demand..."}}`.
- **Root Cause:** Single-pass generation in `GeminiProvider` immediately surrendered upon receiving a 503 spike instead of executing exponential backoff. Additionally, `gemini-3.8-flash` experienced prolonged latency timeouts.
- **Relevant Source Files:**
  - `src/lib/ai/providers/gemini.provider.ts`
  - `src/lib/ai/model-router.ts`
- **Required Fix:**
  1. Set `gemini-3.5-flash-lite` as the primary engine for 3–5s generation speed.
  2. Implemented 3-pass exponential backoff (2s / 4s) across candidate models.
  3. Increased large-payload timeout to 30,000ms.
- **Verification Procedure:** Tested 6/6 AI features; all recovered from intermittent 503 spikes and succeeded.

---

### BUG-007: Fabricated Analytics, Mocked Team Members & Workspace Crashing
- **Bug ID:** `BUG-007`
- **Affected Feature:** Analytics Dashboard, Team Management, Workspace Switching
- **Severity:** `P2 — Moderate` (Misleading demonstration metrics & prerender failures)
- **User-Visible Symptoms:**
  1. Analytics displayed fabricated follower growth charts (`+12.4%`, `45.2k impressions`) for brand new accounts.
  2. Team page displayed fake seed members (`Sarah Connor`, `Alex Murphy`).
  3. Workspace switcher crashed during build with `Cannot read properties of undefined (reading 'name')`.
- **Steps to Reproduce:**
  1. Register a new account and visit `/app/analytics`.
  2. Notice fake graph spikes for accounts that were never connected.
- **Actual Error:** Static seed arrays (`INITIAL_MEMBERS`, `CHART_DATA`) rendered as production data.
- **Root Cause:** Placeholder mockup arrays hardcoded directly in client page components.
- **Relevant Source Files:**
  - `src/app/app/analytics/page.tsx`
  - `src/app/app/team/page.tsx`
  - `src/app/app/workspaces/page.tsx`
- **Required Fix:** Removed all fake metrics and seed users. Bound pages to authenticated API endpoints (`/api/me`, `/api/team`, `/api/workspaces`) with clean, helpful empty states when no data exists.
- **Verification Procedure:** Brand new accounts show 0 metrics, 1 owner member, and their single default workspace.
