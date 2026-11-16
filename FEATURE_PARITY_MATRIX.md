# SAUCER — SOCIAL MEDIA FEATURE PARITY MATRIX

This document provides a comparative matrix of publishing capabilities, media format constraints, OAuth scopes, and developer status across all supported social networks in **Saucer**.

---

## 1. Multi-Platform Capability Matrix

| Feature / Platform | **Instagram** | **Facebook Pages** | **LinkedIn** | **YouTube** | **Pinterest** | **X (Twitter)** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Provider Key** | `INSTAGRAM` | `FACEBOOK` | `LINKEDIN` | `YOUTUBE` | `PINTEREST` | `X` |
| **Implementation Status** | **Verified (Phase B)** | **Verified (Phase C)** | **Verified (Phase D)** | **Verified (Phase E)** | **Verified (Phase E)** | **Postponed** |
| **Auth Protocol** | Meta OAuth 2.0 | Meta OAuth 2.0 | LinkedIn OAuth 2.0 | Google OAuth 2.0 | Pinterest OAuth 2.0 | OAuth 2.0 PKCE |
| **Token Validity** | 60 Days (Long-Lived) | Never Expires (Page Token) | 60 Days | 3,600s (Offline Refresh) | 30 Days (Refreshable) | — |
| **Text Only Posts** | ❌ (Media Required) | ✅ Supported | ✅ Supported | ❌ (Video Required) | ❌ (Media Required) | Postponed |
| **Max Text Length** | 2,200 chars | 63,206 chars | 3,000 chars | 5,000 chars (Desc) | 500 chars (Desc) | Postponed |
| **Single Image** | ✅ (JPG, PNG) | ✅ (JPG, PNG) | ✅ (JPG, PNG) | ❌ | ✅ (JPG, PNG) | Postponed |
| **Carousel Posts** | ✅ Up to 10 items | ✅ Up to 10 photos | ❌ (PDF/Doc) | ❌ | ❌ | Postponed |
| **Video Upload** | ✅ Reels (MP4) | ✅ Video & Reels | ✅ Native Video | ✅ Long-form Video | ✅ Video Pins | Postponed |
| **Shorts / Reels** | ✅ Yes (9:16) | ✅ Yes (9:16) | ❌ | ✅ YouTube Shorts | ❌ | Postponed |
| **Max Video Duration** | 15 mins (Reels) | 240 mins | 10 mins | 12 hours | 15 mins | Postponed |
| **Board / Target Selector**| ❌ | ❌ | ❌ | ❌ | ✅ Target Board ID | Postponed |
| **Alt-Text Support** | ✅ Accessibility Alt | ✅ Photo Alt | ✅ Image Alt | ❌ | ✅ Pin Alt Text | Postponed |
| **Analytics Ingestion** | ✅ Reach, Impressions | ✅ Reach, Engagement | ✅ Impressions, Clicks | ✅ Views, Watch Time | ✅ Views, Saves | Postponed |

---

## 2. Developer Approval & Quota Requirements

### 2.1 Instagram Business / Creator
- **Developer Portal**: Meta for Developers (`developers.facebook.com`)
- **API Version**: Meta Graph API `v21.0` (configurable dynamically via `META_GRAPH_API_VERSION`)
- **Required Permissions**: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`
- **Account Eligibility**: Must be a professional Instagram Business or Creator account connected to a Facebook Page. Personal Instagram accounts are not supported by the Meta Graph API.
- **Review Status**: Pre-approved for development; production broadcasting requires Meta App Review.

### 2.2 Facebook Pages
- **Developer Portal**: Meta for Developers
- **API Version**: Meta Graph API `v21.0` (configurable dynamically via `META_GRAPH_API_VERSION`)
- **Required Permissions**: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `public_profile`
- **Review Status**: Tested and certified in Development mode with page-scoped access tokens.

### 2.3 LinkedIn (Profiles & Organization Pages)
- **Developer Portal**: LinkedIn Developer Portal (`linkedin.com/developers`)
- **API Version**: LinkedIn REST Protocol Version `202610` (October 2026 release)
- **Required Permissions**:
  - `openid`, `profile`, `email`: Standard Sign-In with LinkedIn.
  - `w_member_social`: Member posting (included with Share on LinkedIn).
  - `w_organization_social`: Organization page posting requires explicit approval under the **LinkedIn Community Management API** program.
- **Review Status**: Personal profiles verified; Company page publishing clearly flagged as requiring Community Management approval.

### 2.4 YouTube
- **Developer Portal**: Google Cloud Console
- **Required Scopes**: `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube.readonly`
- **Quota Constraints**: In the current YouTube Data API v3, `videos.insert` (video uploads) operates within YouTube's dedicated Video Upload Quota allocation rather than deducting from the legacy 1,600-unit general Data API read/write project quota (which remains 10,000 units/day for metadata queries). Higher upload thresholds require Google Cloud Quota increase requests.

### 2.5 Pinterest
- **Developer Portal**: Pinterest Developers (`developers.pinterest.com`)
- **Required Scopes**: `boards:read`, `pins:read`, `pins:write`, `user_accounts:read`
- **Review Status**: Verified on Pinterest API v5.

### 2.6 X (Twitter)
- **Status**: **Postponed**
- **Justification**: X API v2 Basic Tier ($100/mo) and Pro Tier ($5,000/mo) represent significant ongoing financial commitments. In strict alignment with Saucer's zero-waste financial directive, X integration remains postponed until formal commercial approval.
