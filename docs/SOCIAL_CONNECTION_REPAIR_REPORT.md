# SAUCER — SOCIAL CONNECTION REPAIR & AUDIT REPORT
**Date:** November 17, 2026  
**Status:** Code Repaired & Provider Requirements Documented  
**Branch:** `fix/production-stabilization`  

---

## 1. WHY SOCIAL ACCOUNT CONNECTIONS WERE FAILING

When the owner attempted to connect social accounts in the live application, all connections failed. Our audit revealed two fundamental issues:

1. **Unconfigured Production Environment Variables**:
   In production (Vercel), none of the third-party OAuth Client IDs or Secrets were configured. 
2. **Silent Mock Fallbacks in Authorization Code**:
   Because the environment variables were missing, the provider classes (`FacebookProvider`, `LinkedInProvider`, `YouTubeProvider`, etc.) fell back to hardcoded strings like `"meta_app_mock_id"`, `"linkedin_mock_client_id"`, and `"google_mock_client_id"`.
   When the browser redirected to:
   - Facebook/Instagram: `https://www.facebook.com/v21.0/dialog/oauth?client_id=meta_app_mock_id`
   - LinkedIn: `https://www.linkedin.com/oauth/v2/authorization?client_id=linkedin_mock_client_id`
   - Google/YouTube: `https://accounts.google.com/o/oauth2/v2/auth?client_id=google_mock_client_id`
   
   The external platform immediately displayed errors such as:
   - **Meta:** *"Invalid App ID"*
   - **LinkedIn:** *"Client authentication failed"*
   - **Google:** *"Error 401: invalid_client"*
   - **Pinterest:** *"Invalid Client ID"*

3. **Simulated Success Handshakes**:
   In local tests, the providers contained mock interceptors that returned fake accounts like `"Acme Creative Studio"` or `"Sarah Jenkins, VP Marketing"`. These have now been **strictly removed**.

---

## 2. PROVIDER-BY-PROVIDER AUDIT & CONFIGURATION GUIDE

### A. Meta (Facebook Pages & Instagram Business/Creator)
- **Engine Implementation**: [`src/lib/social/providers/facebook.provider.ts`](file:///c:/Users/check/Desktop/saucer/src/lib/social/providers/facebook.provider.ts) and [`src/lib/social/providers/instagram.provider.ts`](file:///c:/Users/check/Desktop/saucer/src/lib/social/providers/instagram.provider.ts).
- **Environment Variables Required in Vercel**:
  - `META_APP_ID`: Your Meta App ID from developers.facebook.com.
  - `META_APP_SECRET`: Your Meta App Secret.
  - `META_GRAPH_API_VERSION`: `"v21.0"` (default).
- **Authorized Redirect URIs (Meta App Dashboard → Facebook Login / Instagram Settings)**:
  - `https://<your-vercel-domain>.vercel.app/api/social/oauth/facebook/callback`
  - `https://<your-vercel-domain>.vercel.app/api/social/oauth/instagram/callback`
- **Required Meta Scopes**:
  - Facebook: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `public_profile`.
  - Instagram: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`.
- **Requirements for Live Production**:
  - In Meta Developer Portal, the app must be in **Live Mode** (or tester accounts must be added under App Roles).
  - Business verification is required by Meta for public publishing permissions.

---

### B. LinkedIn (Personal Profiles & Company Pages)
- **Engine Implementation**: [`src/lib/social/providers/linkedin.provider.ts`](file:///c:/Users/check/Desktop/saucer/src/lib/social/providers/linkedin.provider.ts).
- **Environment Variables Required in Vercel**:
  - `LINKEDIN_CLIENT_ID`: LinkedIn Developer App Client ID.
  - `LINKEDIN_CLIENT_SECRET`: LinkedIn Developer App Client Secret.
- **Authorized Redirect URI (LinkedIn Developer Portal → Auth)**:
  - `https://<your-vercel-domain>.vercel.app/api/social/oauth/linkedin/callback`
- **Required Products & Scopes**:
  - Products to enable: *"Share on LinkedIn"* and *"Sign In with LinkedIn using OpenID Connect"*.
  - Scopes: `openid`, `profile`, `email`, `w_member_social`.

---

### C. Google / YouTube & YouTube Shorts
- **Engine Implementation**: [`src/lib/social/providers/youtube.provider.ts`](file:///c:/Users/check/Desktop/saucer/src/lib/social/providers/youtube.provider.ts).
- **Environment Variables Required in Vercel**:
  - `GOOGLE_CLIENT_ID`: Google Cloud OAuth 2.0 Web Client ID.
  - `GOOGLE_CLIENT_SECRET`: Google Cloud OAuth 2.0 Web Client Secret.
- **Authorized Redirect URI (Google Cloud Console → Credentials)**:
  - `https://<your-vercel-domain>.vercel.app/api/social/oauth/youtube/callback`
- **Required APIs**:
  - Enable **YouTube Data API v3** in Google Cloud Console.
  - Scopes: `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube.readonly`, `https://www.googleapis.com/auth/userinfo.profile`.

---

### D. Pinterest
- **Engine Implementation**: [`src/lib/social/providers/pinterest.provider.ts`](file:///c:/Users/check/Desktop/saucer/src/lib/social/providers/pinterest.provider.ts).
- **Environment Variables Required in Vercel**:
  - `PINTEREST_APP_ID`: Pinterest App ID.
  - `PINTEREST_APP_SECRET`: Pinterest App Secret.
- **Authorized Redirect URI**:
  - `https://<your-vercel-domain>.vercel.app/api/social/oauth/pinterest/callback`
- **Required Scopes**:
  - `boards:read`, `pins:read`, `pins:write`, `user_accounts:read`.

---

## 3. TOKEN SECURITY & AT-REST ENCRYPTION

All social account tokens are encrypted before being written to Supabase:
- **Algorithm**: `AES-256-GCM` with random 96-bit initialization vectors (IV) and authentication tags.
- **File**: [`src/lib/security/encryption.ts`](file:///c:/Users/check/Desktop/saucer/src/lib/security/encryption.ts).
- **Payload Format**: `iv_hex:auth_tag_hex:ciphertext_hex`.
- **Environment Variable**: `ENCRYPTION_KEY` (must be consistent across deployments to allow decrypting existing tokens).
- Plaintext access tokens and refresh tokens are strictly excluded from all client-facing API responses (`/api/social/accounts`).
