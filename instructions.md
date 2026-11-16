# SAUCER — PRIORITY 2: GEMINI AI ENGINE & CREDIT LEDGER

Supabase Priority 1 has been implemented and tested.

We are now implementing Saucer AI as a real backend service.

Read the existing Saucer documentation and source code before making changes.

This is an implementation task, not another architecture-only exercise.

## BUSINESS CONSTRAINTS

These are mandatory:

- Zero budget for AI API consumption.
- Google Gemini API through its unpaid API tier only.
- No paid AI model fallback.
- No BYOK requirement for customers.
- No automatic billing activation.
- No paid image generation.
- No paid video generation.
- All AI requests must use our server-side API key.
- Customers receive AI allowances according to their subscription.
- Internal credit balances must be enforced server-side.

## STEP 1 — VERIFY GEMINI MODELS

Inspect Google's current official documentation before implementation.

Our initial model preferences:

- gemini-3.8-flash
- gemini-3.5-flash-lite

Verify:
- Model availability.
- API model identifiers.
- Text generation support.
- Structured output support.
- Image input support.
- Actual free-tier availability.
- Project-specific rate limits.

Do not assume every account has identical quota limits.

Use configurable model routing rather than hardcoding model assumptions throughout the application.

Never activate a paid billing tier.

## STEP 2 — IMPLEMENT THE AI PROVIDER

Use the official Google Gen AI SDK.

Create a modular provider architecture.

Suggested structure:

src/
  lib/
    ai/
      providers/
        gemini.provider.ts
      ai.service.ts
      model-router.ts
      prompt-registry.ts
      schema-validator.ts
      usage-tracker.ts
      quota-controller.ts
  services/
    credits/
      credit.service.ts
      reservation.service.ts
      ledger.service.ts

Adapt this to the actual repository structure rather than blindly copying it.

All AI requests must execute server-side.

Never expose GEMINI_API_KEY to browser code.

## STEP 3 — IMPLEMENT ACTUAL AI FEATURES

Implement the following:

1. Quick caption generation.
2. Hashtag and emoji suggestions.
3. Tone rewriting.
4. Multi-platform content adaptation.
5. Viral thread generation.
6. Image-to-caption generation.
7. Seven-day content calendar ideation.

Use model-appropriate prompts.

Use structured output where useful.

Validate every AI response using Zod.

Do not trust generated JSON until it passes schema validation.

If the provider returns invalid data, handle the error safely and release the reserved credits.

AI features must return actual Gemini responses, not simulated examples.

## STEP 4 — IMPLEMENT A REAL DOUBLE-ENTRY CREDIT LEDGER

Review the existing AI credit architecture document.

Important architectural correction:

A mutable transaction record that changes from PENDING to SETTLED or REFUND is not an immutable ledger.

Separate operational reservation state from immutable accounting entries.

Implement:

### AiCreditBalance

Maintain fast account balance lookup.

Include:
- organizationId
- monthlyAllowance
- monthlyUsed
- reservedCredits
- purchasedCredits
- billingPeriodStart
- billingPeriodEnd
- updatedAt

Adjust naming and fields to match the final database design where necessary.

### AiCreditReservation

Maintain the lifecycle of each AI request.

Include:
- organizationId
- userId
- operation
- requestedCredits
- reservationStatus
- idempotencyKey
- createdAt
- expiresAt
- settledAt

Reservation states should distinguish:
- RESERVED
- COMMITTED
- RELEASED
- EXPIRED
- RECONCILIATION_REQUIRED

### AiCreditLedgerEntry

This must be append-only.

Include:
- organizationId
- reservationId
- entryType
- debitAccount
- creditAccount
- amount
- model
- feature
- inputTokens
- outputTokens
- providerCost
- idempotencyKey
- createdAt

Create appropriate database constraints and indexes.

Prevent application-level UPDATE and DELETE operations on finalized ledger entries.

A reservation, commitment, release or grant must create auditable accounting entries.

Ensure that each accounting transaction balances.

Use a materialized balance for performance, but ensure the ledger and balance remain consistent.

### Transaction concurrency

Implement atomic reservation using PostgreSQL transactions and row-level locking.

Settlement and release operations must lock the relevant reservation and balance records.

Prevent two concurrent settlement requests from decrementing the same reservation twice.

Use unique idempotency keys.

Test concurrent requests using multiple simultaneous API calls.

### Credit consumption

Use monthly allowance credits first.

Preserve non-expiring purchased credits separately.

Prevent negative balances.

Never trust a customer-supplied credit amount.

Only backend-defined feature costs can determine reservation amounts.

## STEP 5 — MONTHLY RESET

Implement a durable monthly billing-cycle mechanism.

Requirements:

- Align monthly allocations with subscription billing periods.
- Create a new allocation entry for every renewal.
- Do not erase historical ledger entries.
- Preserve eligible purchased credits.
- Do not clear active reservations blindly.
- Handle plan upgrades and downgrades.
- Handle renewal failures and cancellations.
- Prevent duplicate monthly allocations.

For stuck reservations, implement recovery and reconciliation.

A reservation must not be released merely because a timer expired without checking the request lifecycle.

## STEP 6 — GLOBAL GEMINI QUOTA CONTROLLER

This is critical.

Vercel functions can run on separate instances, so an in-memory quota counter is insufficient.

Implement shared quota coordination using transactional PostgreSQL operations or an equivalent persistent distributed mechanism.

Track:

- Requests per minute.
- Input tokens per minute.
- Requests per day.
- Model-specific usage.
- Concurrent requests.
- Internal safety limits.

Read actual quota configuration from environment variables or administrator configuration.

Never hardcode assumed Google quotas as universal values.

Implement:
- Atomic quota reservations.
- Usage reconciliation.
- 429 handling.
- Retry-after support.
- Exponential backoff.
- Request timeouts.
- Concurrency limits.
- Administrative AI kill switch.

Google's daily quota resets according to its documented Pacific-time schedule. Account for this correctly.

Never automatically fall back to a paid model.

## STEP 7 — FREE API PRIVACY

Create a clear AI privacy notice.

The notice must disclose that Google may use content submitted through the unpaid API tier to improve its products.

Do not describe the free tier as confidential processing.

Avoid sending unnecessary personal data, confidential client information or credentials to the provider.

Do not store raw sensitive prompts in application logs unnecessarily.

## STEP 8 — API ENDPOINTS

Implement endpoints for:

POST /api/ai/caption
POST /api/ai/hashtags
POST /api/ai/rewrite
POST /api/ai/adapt
POST /api/ai/thread
POST /api/ai/vision
POST /api/ai/calendar

Also implement:

GET /api/ai/credits
GET /api/ai/usage

Every endpoint must:
- Authenticate the user.
- Verify organization membership.
- Determine the operation cost server-side.
- Check available credits.
- Reserve credits atomically.
- Check shared provider quota.
- Call Gemini.
- Validate the response.
- Settle credits on success.
- Release credits on confirmed failure.
- Return current balance and usage information.

Do not let frontend requests specify arbitrary model names, token limits or credit costs.

## STEP 9 — TESTING

Create actual automated tests for:

1. Successful caption generation.
2. Successful rewriting.
3. Structured multi-platform output.
4. Invalid AI response.
5. Provider timeout.
6. Provider rate limit exhaustion.
7. Insufficient customer credits.
8. Concurrent reservation attempts.
9. Duplicate settlement attempts.
10. Duplicate release attempts.
11. Expired reservation recovery.
12. Monthly allocation duplication prevention.
13. Concurrent requests from different users.
14. Cross-organization AI credit access prevention.
15. Global quota exhaustion.

Use a mock provider for unit tests.

Also perform at least one real Gemini API integration test with an unpaid API key.

Clearly distinguish mocked tests from actual provider tests.

## STEP 10 — DELIVERABLES

Create or update:

- AI_SYSTEM.md
- AI_CREDIT_SYSTEM.md
- AI_PROVIDER_ARCHITECTURE.md
- AI_QUOTA_MANAGEMENT.md
- AI_PRIVACY.md
- DATABASE_SCHEMA.md
- API_DOCUMENTATION.md
- TESTING.md

Create:

AI_PHASE_2_REPORT.md

The report must document actual functionality implemented, tests performed, real versus mocked integration results, current quota configuration, unresolved issues and security limitations.

Do not implement Dodo Payments or social OAuth in this priority.

Do not deploy publicly.

Do not enable paid billing.

Complete Saucer AI and its credit ledger first, then report the verified results.