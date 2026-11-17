# SAUCER — Priority 4: Social Media OAuth & Account Integrations Report

**Date of Execution**: November 17, 2026  
**Status**: 100% Implemented, Verified & Tested  
**Target Platforms**: Instagram Business/Creator, Facebook Pages, LinkedIn, YouTube, Pinterest  
**Postponed Platforms**: X (Twitter) postponed pending commercial API cost evaluation  
**Token Security**: AES-256-GCM Authenticated Encryption at Rest

---

## 1. Platform Feasibility & Architecture Assessment

In strict accordance with Saucer's zero-budget financial directive, social integrations operate exclusively via official platform APIs without scraping, unauthorized browser automation, or paid third-party wrapper gateways:

1. **Instagram**: Feasible via Meta Graph API v21.0. Requires professional Business or Creator account connected to a Facebook Page. Supports single image, carousel (up to 10 items), and Reels video containers.
2. **Facebook Pages**: Feasible via Meta Graph API v21.0. Supports page authorization, page-scoped tokens, text updates, photos, and video reels.
3. **LinkedIn**: Feasible for individual member posts (`w_member_social`). Organization page publishing requires the **LinkedIn Community Management API** program; clearly documented without claiming unverified Standard access.
4. **YouTube**: Feasible via Google OAuth 2.0 and YouTube Data API v3. Strict quota awareness implemented: standard quota is 10,000 units/day (video upload costs 1,600 units).
5. **Pinterest**: Feasible via Pinterest API v5. Supports visual Pins targeting boards.
6. **X (Twitter)**: Postponed as instructed due to recurring platform API fees ($100–$5,000/mo).

---

## 2. Implemented Architecture

### 2.1 Unified Provider Interface (`src/lib/social/types.ts`)
Standardized contract implemented by all providers:
- `getAuthorizationUrl(params)`: Generates signed OAuth authorization URL.
- `exchangeCodeForTokens(params)`: Exchanges authorization code for long-lived tokens.
- `refreshAccessToken(refreshToken)`: Refreshes credentials server-side.
- `getAccountProfile(accessToken)`: Queries platform profile and account type.
- `getPublishingCapabilities()`: Discovers format constraints (text length, media requirements, carousels, video duration).
- `publishPost(accessToken, accountId, post)`: Publishes content to the network.
- `checkPostStatus(accessToken, publishJobId)`: Polls async container processing status.

### 2.2 Providers Built (`src/lib/social/providers/`)
- **`InstagramProvider` (`instagram.provider.ts`)**: Meta Graph API, container creation (`POST /{ig-user-id}/media`), status polling, and publishing (`POST /{ig-user-id}/media_publish`). Supports single image, carousel (10), and Reels.
- **`FacebookProvider` (`facebook.provider.ts`)**: Meta Graph API, page discovery (`GET /me/accounts`), page-scoped tokens, text feed publishing, photos, and videos.
- **`LinkedInProvider` (`linkedin.provider.ts`)**: OpenID Connect + REST Posts API (`POST https://api.linkedin.com/rest/posts`), 3,000 char limit, profile author URNs.
- **`YouTubeProvider` (`youtube.provider.ts`)**: Google OAuth 2.0, YouTube Data API v3, video upload format validation, Shorts support, and daily quota tracking.
- **`PinterestProvider` (`pinterest.provider.ts`)**: Pinterest API v5, board selection, and Pin image publishing.
- **`ProviderRegistry` (`provider-registry.ts`)**: Centralized provider lookup and capability factory.

### 2.3 Token Encryption at Rest (`src/lib/security/encryption.ts`)
- **Algorithm**: **AES-256-GCM** with 96-bit random IV and 128-bit authentication tag.
- **Integrity**: Any bit-flipping or ciphertext tampering triggers authentication failure and is rejected.
- **Format**: `iv_hex:auth_tag_hex:ciphertext_hex` stored in `SocialAccount.encryptedAccessToken` and `SocialAccount.encryptedRefreshToken`.
- **Zero Frontend Leakage**: Client API responses return sanitized metadata only. Plaintext tokens never reach the browser.

### 2.4 Database Models on Supabase (`xfqapdxeladfvivlwltp`)
- **`SocialAccount`**:
  - Fields: `id`, `organizationId`, `workspaceId`, `provider`, `providerAccountId`, `accountName`, `accountHandle`, `accountType`, `avatarUrl`, `encryptedAccessToken`, `encryptedRefreshToken`, `tokenExpiresAt`, `grantedScopes`, `connectionStatus`, `lastRefreshedAt`, `metadata`.
  - Unique Constraint: `[workspaceId, provider, providerAccountId]`.
  - Non-recursive RLS policies: scoped with `public.is_org_member()`.
- **`OAuthState`**:
  - Fields: `id`, `state` (UNIQUE), `organizationId`, `workspaceId`, `userId`, `provider`, `codeVerifier`, `returnUrl`, `expiresAt`.
  - 15-minute TTL; single-use deletion immediately upon callback receipt.

### 2.5 API Endpoints
- `GET /api/social/accounts`: Lists sanitized connected accounts.
- `POST /api/social/oauth/:provider/authorize`: Initiates OAuth handshake.
- `GET /api/social/oauth/:provider/callback`: Validates state, exchanges tokens, encrypts at rest, and redirects.
- `POST /api/social/accounts/:id/disconnect`: Disconnects channel and cleans tokens.
- `POST /api/social/accounts/:id/refresh`: Manually refreshes token.
- `POST /api/social/accounts/:id/publish`: Publishes post or validates format constraints.

---

## 3. Automated Test Verification (`scripts/test-social-suite.js`)

All 10 required test scenarios passed against live Supabase PostgreSQL:

| Scenario # | Description | Verification Type | Result |
| :--- | :--- | :--- | :--- |
| **1** | Successful OAuth & AES-256-GCM Token Encryption | Ciphertext storage & decryption | **PASSED** |
| **2** | Invalid OAuth State & Expired State Cleanup | State validation & TTL cleanup | **PASSED** |
| **3** | Invalid Token Detection (Tampered Ciphertext) | GCM authentication tag rejection | **PASSED** |
| **4** | Expired Token Detection & Health Status Flagging | Temporal expiration check | **PASSED** |
| **5** | Token Refresh Handling & Credential Update | Server-side refresh & re-encryption | **PASSED** |
| **6** | Missing Required Permissions Detection | Provider scope validation | **PASSED** |
| **7** | Duplicate Account Connection (Idempotent Upsert) | PostgreSQL unique constraint | **PASSED** |
| **8** | Account Disconnection & Credential Sanitization | Lifecycle update & token clearing | **PASSED** |
| **9** | Cross-Organization Account Access (RLS Isolation) | Multi-tenant tenant blocking | **PASSED** |
| **10** | Multi-Platform Publishing Constraints & Capabilities | Format validation (IG, FB, LI, YT, Pin) | **PASSED** |

**Final Verification Score**: **10/10 PASSED (100%)**

---

## 4. Frontend Integration (`src/app/app/social-accounts/page.tsx`)

- Connected to live `/api/social/accounts` endpoint.
- Displays active channel count against subscription plan limit.
- One-click "Connect" button starts official OAuth flow for Instagram, Facebook, LinkedIn, YouTube, and Pinterest.
- X (Twitter) displays a clear "Costs & Evaluation In Progress — Postponed" badge.
- Interactive cards display platform icons, handles, capability tags (Text, Image, Video, Carousel, Shorts/Reels), and token expiration warning badges.
- Disconnect and Refresh Token actions fully functional.
- Wrapped in Next.js `<Suspense>` boundary for static prerendering compatibility.
