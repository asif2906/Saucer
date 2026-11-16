# SAUCER — PHASE 2: REAL BACKEND INTEGRATION

Phase 1 is complete according to PHASE_1_REPORT.md.

We are now moving from frontend development to real backend functionality.

Before implementation, inspect the existing Phase 1 codebase and all project documentation.

Do not rebuild the frontend or change the Saucer visual identity.

## PRIORITY 1 — SUPABASE

Implement real Supabase integration.

- Real registration and login.
- Email verification.
- Persistent sessions.
- Password recovery.
- Protected routes.
- User profile persistence.
- Organization creation.
- Workspace creation.
- Organization membership.
- Workspace membership.
- Role-based authorization.
- Row Level Security.

Test complete signup-to-dashboard functionality.

Verify that one user's data cannot be accessed by another user.

## PRIORITY 2 — SAUCER AI

Implement the actual Gemini API integration.

- Use only eligible Google AI Studio free-tier models.
- Use our server-side GEMINI_API_KEY.
- Implement a modular AI provider.
- Implement the global quota controller using persistent shared coordination, not process-local memory.
- Add RPM, TPM, RPD and concurrency protection.
- Implement proper 429 handling.
- Never automatically activate a paid provider.

Implement the actual AI credit system:

- AiCreditBalance.
- AiCreditTransaction.
- Atomic reservations.
- Idempotent settlement.
- Automatic refunds.
- Reservation expiration and recovery.
- Monthly allowance resets.
- Audit history.

Remove any duplicate authoritative AI balance stored in Profile.

Build and test actual caption generation, rewriting, hashtags, multi-platform adaptation and thread generation.

Do not leave simulated AI functionality presented as real AI.

## PRIORITY 3 — DODO PAYMENTS

Integrate Dodo Payments in test mode.

- Checkout Sessions.
- Subscription creation.
- Subscription renewals.
- Cancellation.
- Upgrades and downgrades.
- Webhook validation.
- Idempotent event processing.
- Customer Billing Portal.
- AI credit pack purchases.

Do not grant paid access from checkout redirects.

Only verified server-side events can change subscription entitlements.

Razorpay must not be introduced.

## PRIORITY 4 — SOCIAL ACCOUNT INTEGRATIONS

Begin with X and LinkedIn.

- OAuth connection.
- Secure token storage.
- Token refresh.
- Account retrieval.
- Disconnect functionality.
- Token expiration handling.

Use official APIs and implement actual API requests.

Clearly document which provider developer credentials and approval permissions are required.

Do not simulate a successful account connection.

## PRIORITY 5 — PUBLISHING ENGINE

Inspect the existing Postiz scheduling architecture and approved Saucer architecture.

Implement:

- Post persistence.
- Scheduled publishing records.
- Background execution.
- Retry logic.
- Idempotency.
- Publishing status.
- Error tracking.
- Timezone-aware execution.

Do not force long-running jobs onto Vercel serverless functions.

Determine the appropriate durable worker infrastructure.

## TESTING REQUIREMENTS

Run actual integration tests using test credentials.

Verify:

1. User registration and login.
2. Workspace persistence.
3. Organization-level data isolation.
4. Successful live Gemini generation.
5. Concurrent AI credit reservations.
6. Failed AI request refunds.
7. Global AI quota exhaustion.
8. Dodo test checkout.
9. Duplicate webhook handling.
10. Social OAuth.
11. Scheduled publishing.
12. Publishing retry after failure.

Separate mocked tests from real external API tests.

## IMPORTANT

Work incrementally. Do not attempt all integrations simultaneously.

Complete Supabase first, test it, then implement Saucer AI, Dodo, social connections and publishing.

Maintain documentation.

Do not deploy publicly, switch to paid services, enable live payment mode or make purchases without approval.

At the end of each priority, create a verification report identifying actual working features, mocked functionality, outstanding credentials and known defects.

Begin with the Supabase integration.