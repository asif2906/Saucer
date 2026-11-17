# SAUCER — SOCIAL OAUTH AUDIT & DIAGNOSTICS REPORT
**Project:** Saucer Critical Production Stabilization  
**Branch:** `fix/production-stabilization`  
**Date:** November 17, 2026  
**Status:** Architecture Repaired & Diagnostics Framework Implemented

---

## 1. Executive Summary
The owner reported that none of the social account connections worked in production. A full forensic audit revealed that previous implementations relied on hardcoded fallback dummy IDs (such as `"meta_app_mock_id"`, `"linkedin_mock_client_id"`, `"google_mock_client_id"`, and `"pinterest_mock_app_id"`), and simulated callbacks returning static demo users (`Demo User`, `demo_profile_picture.jpg`).

This stabilization refactor:
1. Completely removes all fake credentials, mock profiles, and simulated redirects from provider classes.
2. Implements a secure OAuth state parameter containing HMAC-signed CSRF tokens, expiration timestamps, and target workspace correlation.
3. Implements AES-256-GCM token encryption via `TokenEncryptionService`.
4. Establishes a comprehensive connection diagnostics system returning clear, user-facing error explanations instead of raw crashes or ambiguous redirects.

---

## 2. Social OAuth Architecture Trace

```
[User clicks "Connect"]
        │
        ▼
[GET /api/social/oauth/[provider]/authorize]
        │
        ├─► Validates authenticated user session & workspace membership
        ├─► Validates presence of provider Client ID & Client Secret in server environment
        ├─► Generates secure cryptographic state: { workspaceId, userId, csrf, timestamp }
        ├─► Constructs provider authorization URL with approved scopes & exact redirect URI
        │
        ▼
[External Provider OAuth Consent Screen]
        │ (User grants permission)
        ▼
[GET /api/social/oauth/[provider]/callback?code=...&state=...]
        │
        ├─► Validates state parameter authenticity & freshness (rejects replay attacks)
        ├─► Exchanges authorization code for access token & refresh token (POST to provider)
        ├─► Fetches authenticated provider profile (account ID, name, handle, avatar)
        ├─► Encrypts tokens using AES-256-GCM (TOKEN_ENCRYPTION_SECRET)
        ├─► Upserts SocialAccount record into PostgreSQL matching workspace
        │
        ▼
[Redirect to /app/social-accounts?status=connected&provider=...]
```

---

## 3. Provider-by-Provider Diagnostic Matrix

### A. Meta: Instagram Business / Creator
- **Source File:** `src/lib/social/providers/instagram.provider.ts`
- **Required Scopes:** `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`
- **Required Server Env:** `META_APP_ID`, `META_APP_SECRET`
- **Redirect URI:** `https://<DOMAIN>/api/social/oauth/instagram/callback`
- **Root Cause of Original Failure:** When `META_APP_ID` was not configured on Vercel, the provider submitted `"meta_app_mock_id"`, which Meta's OAuth server rejected with `Invalid client_id`.
- **Status:** **Repaired.** Mock IDs removed; server returns safe configuration diagnostic if credentials are missing in Vercel.
- **Provider Approval Requirements:** Requires Meta App Review for `instagram_content_publish` to access accounts outside development test users.

### B. Meta: Facebook Pages
- **Source File:** `src/lib/social/providers/facebook.provider.ts`
- **Required Scopes:** `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`
- **Required Server Env:** `META_APP_ID`, `META_APP_SECRET`
- **Redirect URI:** `https://<DOMAIN>/api/social/oauth/facebook/callback`
- **Root Cause of Original Failure:** Identical mock fallback issue as Instagram.
- **Status:** **Repaired.** Clean OAuth authorization code exchange implemented.
- **Provider Approval Requirements:** Requires Meta Business Verification and App Review for public Facebook Page management.

### C. LinkedIn: Profiles & Company Pages
- **Source File:** `src/lib/social/providers/linkedin.provider.ts`
- **Required Scopes:** `openid`, `profile`, `email`, `w_member_social`
- **Required Server Env:** `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
- **Redirect URI:** `https://<DOMAIN>/api/social/oauth/linkedin/callback`
- **Root Cause of Original Failure:** Defaulted to `"linkedin_mock_client_id"`. In addition, a separate personal access token was incorrectly suggested in earlier sessions as a global application API key.
- **Status:** **Repaired.** Enforces true 3-legged OAuth with PKCE state; individual user tokens are encrypted per workspace.
- **Provider Approval Requirements:** Requires the "Share on LinkedIn" and "Sign In with LinkedIn using OpenID Connect" products enabled in the LinkedIn Developer Portal.

### D. Google: YouTube
- **Source File:** `src/lib/social/providers/youtube.provider.ts`
- **Required Scopes:** `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube.readonly`
- **Required Server Env:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Redirect URI:** `https://<DOMAIN>/api/social/oauth/youtube/callback`
- **Root Cause of Original Failure:** Defaulted to `"google_mock_client_id"`.
- **Status:** **Repaired.** Implemented offline access token exchange (`access_type=offline`, `prompt=consent`) to obtain long-lived refresh tokens.
- **Provider Approval Requirements:** Google Cloud Console project must enable "YouTube Data API v3" and configure the OAuth consent screen.

### E. Pinterest
- **Source File:** `src/lib/social/providers/pinterest.provider.ts`
- **Required Scopes:** `boards:read`, `pins:read`, `pins:write`
- **Required Server Env:** `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET`
- **Redirect URI:** `https://<DOMAIN>/api/social/oauth/pinterest/callback`
- **Root Cause of Original Failure:** Defaulted to `"pinterest_mock_app_id"`.
- **Status:** **Repaired.** Implemented Pinterest v5 API token exchange.
- **Provider Approval Requirements:** Pinterest Developer App in "Trial" or "Standard" access tier.

### F. X (Twitter)
- **Status:** **Postponed as directed.** X API access remains deferred until enterprise tier pricing is approved. The UI displays an informative badge explaining that X integration is currently paused.

---

## 4. Connection Diagnostics Framework

All OAuth failure scenarios now return standardized user-friendly error codes:

| Diagnostic Code | Meaning | User Guidance |
| :--- | :--- | :--- |
| `ERR_PROVIDER_NOT_CONFIGURED` | Server environment lacks App ID or App Secret | "This provider has not yet been configured with production API credentials." |
| `ERR_INVALID_REDIRECT_URI` | Domain mismatch between Vercel and Provider Console | "The callback URL must be added to the authorized redirects in the developer console." |
| `ERR_STATE_MISMATCH_OR_EXPIRED` | Replay attack attempt or session expired (>15 mins) | "Authorization request expired. Please initiate connection again." |
| `ERR_ACCESS_DENIED_BY_USER` | Customer clicked "Cancel" on provider screen | "Account connection was cancelled." |
| `ERR_SCOPE_NOT_APPROVED` | App lacks permission in provider developer portal | "The requested publishing permissions are pending review by the platform." |
| `ERR_TOKEN_REFRESH_FAILED` | User revoked access or refresh token expired | "Social account connection has expired. Please click Reconnect." |

---

## 5. Token Security & Privacy Guarantees
1. **Zero Global Tokens:** Never share or store a global access token across users. Every customer must authorize their own social account.
2. **AES-256-GCM Encryption:** Tokens are encrypted prior to insertion into the `SocialAccount` table using `TOKEN_ENCRYPTION_SECRET`.
3. **No Frontend Leaks:** API responses from `/api/social/accounts` strictly omit `encryptedAccessToken` and `encryptedRefreshToken`, returning only public metadata (`accountName`, `accountHandle`, `avatarUrl`, `status`).
