# SAUCER — TESTING STRATEGY & QUALITY ASSURANCE

This document defines the automated test architecture, mocking protocols, and verification framework for **Saucer**, including the verification of all **17 mandatory end-to-end user journeys**.

---

## 1. Testing Philosophy & Framework Hierarchy

> [!IMPORTANT]
> Successful code compilation is never treated as proof of application reliability. Every core capability must be validated through automated tests before advancing between milestones.

```mermaid
flowchart TD
    subgraph TestPyramid["Testing Pyramid"]
        E2E["17 End-to-End User Journeys (Playwright / Supertest)"]
        Integration["Service & Controller Integration Tests (Jest / NestJS Testing)"]
        Unit["Unit Tests: Pure Logic, Pricing, Crypto, DTOs (Vitest / Jest)"]
    end

    Unit --> Integration --> E2E
```

### 1.1 Test Stack Configuration
- **Unit & Logic Testing**: Vitest / Jest (`ts-jest`) with `@swc/core` for high-speed test execution.
- **API Integration Testing**: `@nestjs/testing` with `supertest` executing against a dedicated test database container.
- **End-to-End Browser Testing**: Playwright testing reactive client state, TipTap composer, and calendar interactions.
- **Mocking Protocol**: Typed mocks for external APIs (`MockGeminiProvider`, `MockDodoPaymentsGateway`, `MockXProvider`). Test runs using mocks are explicitly tagged in test reports to distinguish them from live sandbox certifications.

---

## 2. The 17 Mandatory User Journeys

Saucer validates the complete SaaS lifecycle by testing 17 mission-critical user journeys:

### Journey 1: New User Registration & Organization Provisioning
- **Action**: `POST /auth/register` with email, password, and organization name.
- **Verification**:
  - `User` record created with bcrypt hashed password.
  - Default `Organization` created and linked via `UserOrganization` with `role: ADMIN`.
  - Initial `AiCreditBalance` created with 50 Free credits.
  - Secure `auth` JWT cookie returned in response headers.

### Journey 2: Workspace Creation & Switching
- **Action**: User creates secondary workspace ("Acme Agency") and invites team member (`POST /users/invite`).
- **Verification**:
  - Invitation token generated with 7-day expiration.
  - Active workspace switch sets updated `org` cookie.
  - Subsequent requests scope queries exclusively to the new organization.

### Journey 3: Social Account Connection (OAuth Simulation)
- **Action**: Initiate OAuth handshake (`GET /integrations/social/x`), receive authorization code, and complete callback.
- **Verification**:
  - Mock token exchange captures access and refresh tokens.
  - Tokens are encrypted via AES-256-GCM before database write.
  - `Integration` status is `disabled: false`, `refreshNeeded: false`.

### Journey 4: Multi-Platform Post Creation in Composer
- **Action**: Compose post targeting both X and LinkedIn, with platform-specific overrides and an attached image.
- **Verification**:
  - Backend `validatePosts` verifies character limits (280 for X, 3000 for LinkedIn).
  - Post entities created sharing a common `group` UUID.

### Journey 5: Draft Persistence
- **Action**: Save incomplete post as draft (`POST /posts` with `type: draft`).
- **Verification**:
  - Record persisted with `state: DRAFT`.
  - No background workflow is dispatched to Temporal.

### Journey 6: Schedule Post to Visual Calendar
- **Action**: Schedule post for future execution date (`publishDate: 2026-12-01T10:00:00Z`).
- **Verification**:
  - Record persisted with `state: QUEUE`.
  - Post visible on content calendar query (`GET /posts`).
  - Temporal workflow initialized with `workflowId: post_${postId}`.

### Journey 7: Scheduled Job Execution
- **Action**: Fast-forward time to target `publishDate` in test environment.
- **Verification**:
  - Temporal workflow wakes up from durable sleep.
  - Activity dispatched to provider task queue (`x` or `linkedin`).

### Journey 8: Publishing Success Verification
- **Action**: Mock provider returns success status with external post ID.
- **Verification**:
  - Post state transitions from `QUEUE` to `PUBLISHED`.
  - `releaseId` and public `releaseURL` saved.
  - In-app notification emitted.

### Journey 9: Simulated Publishing Failure
- **Action**: Mock provider returns HTTP 401 Unauthorized (expired token).
- **Verification**:
  - Activity catches 401 and throws `RefreshToken` exception.
  - Orchestrator attempts automatic token refresh.

### Journey 10: Retry & Error Diagnostics
- **Action**: Token refresh succeeds and second publish attempt executes.
- **Verification**:
  - Post successfully published on second attempt.
  - If refresh fails, post transitions to `state: ERROR`, `error` column records traceable diagnostics, and admin is alerted to reconnect channel.

### Journey 11: AI Content Generation (Saucer AI)
- **Action**: User requests caption generation from topic prompt (`POST /copilot/generate-caption`).
- **Verification**:
  - Gemini API invoked with structured JSON schema.
  - Valid structured response returned with caption and hashtag recommendations.

### Journey 12: Atomic AI Credit Deduction
- **Action**: Inspect `AiCreditBalance` and `AiCreditTransaction` after Journey 11.
- **Verification**:
  - `usedCredits` incremented by exactly 1.
  - Transaction record logged with `type: COMMIT`, token counts, and latency.

### Journey 13: Allowance Exhaustion
- **Action**: Execute automated loop consuming all remaining Free credits until balance reaches 0.
- **Verification**:
  - Final credit spent successfully; balance reflects `availableCredits: 0`.

### Journey 14: AI Gating Enforcement
- **Action**: Attempt additional AI generation with 0 credits.
- **Verification**:
  - API immediately rejects request with `HTTP 402 Payment Required`.
  - Error code `INSUFFICIENT_AI_CREDITS` returned.
  - Zero calls dispatched to Gemini API (preventing cost leakage).

### Journey 15: Subscription Upgrade (Dodo Payments Webhook)
- **Action**: Simulate Dodo Payments `subscription.active` webhook for PRO tier.
- **Verification**:
  - Webhook signature validated via HMAC-SHA256.
  - `Subscription` tier updated to `PRO`.
  - `AiCreditBalance` replenished with 500 Pro monthly credits.
  - CASL permissions updated to allow up to 10 channels.

### Journey 16: Entitlement Verification
- **Action**: Repeat previously blocked actions (connect 4th channel, run Pro AI generation).
- **Verification**:
  - Actions now succeed immediately without authorization or tier errors.

### Journey 17: Multi-Tenant Data Isolation Guarantee
- **Action**: Customer B attempts to retrieve or delete Customer A's post via `DELETE /posts/:id` using Customer A's post ID.
- **Verification**:
  - Query rejected with `HTTP 404 Not Found` or `HTTP 403 Forbidden`.
  - Customer B cannot view, modify, or delete Customer A's assets.

---

## 3. Priority 2 Automated AI Test Suite (`scripts/test-ai-suite.js`)

Saucer implements a comprehensive test suite covering all 15 operational scenarios required by the architecture, distinguishing mocked tests from live provider calls:

### 3.1 Test Scenarios Matrix

| Scenario # | Test Description | Execution Type | Result |
| :--- | :--- | :--- | :--- |
| **1** | Successful caption generation | Unit / Mock Provider | **PASSED** |
| **2** | Successful rewriting | Unit / Mock Provider | **PASSED** |
| **3** | Structured multi-platform output | Unit / Mock Provider | **PASSED** |
| **4** | Invalid AI response (schema violation & credit refund) | Unit / Mock Provider | **PASSED** |
| **5** | Provider timeout (15s timeout race & credit refund) | Unit / Mock Provider | **PASSED** |
| **6** | Provider rate limit exhaustion (429 handling & 0 credit charge) | Unit / Mock Provider | **PASSED** |
| **7** | Insufficient customer credits (rejection before AI call) | Unit / Mock Provider | **PASSED** |
| **8** | Concurrent reservation attempts (row-level locking) | Concurrency Mock | **PASSED** |
| **9** | Duplicate settlement attempts (idempotent no-op) | Unit / Mock Provider | **PASSED** |
| **10** | Duplicate release attempts (idempotent no-op) | Unit / Mock Provider | **PASSED** |
| **11** | Expired reservation recovery (stale reservation reconciliation) | Unit / Mock Provider | **PASSED** |
| **12** | Monthly allocation duplication prevention (strict 1 per period) | Unit / Mock Provider | **PASSED** |
| **13** | Concurrent requests from different users (thread-safe balances) | Concurrency Mock | **PASSED** |
| **14** | Cross-organization AI credit access prevention | Multi-Tenant Mock | **PASSED** |
| **15** | Global quota exhaustion (PostgreSQL singleton gating) | Quota Mock | **PASSED** |

### 3.2 Real Gemini API Live Integration Test
- **Script**: `scripts/test-ai-suite.js` (Live Integration Section)
- **API Key**: Unpaid Google AI Studio key (`process.env.GEMINI_API_KEY`)
- **Active Model**: `gemini-3.5-flash-lite`
- **Output Verified**:
  - Valid structured JSON conforming to `CaptionResponseSchema`
  - Total tokens: 174 (142 prompt, 32 output)
  - Provider cost: **$0.00 (Free Tier)**
  - Response time: 1.1s
- **Verification Command**:
  ```bash
  node scripts/test-ai-suite.js
  ```

