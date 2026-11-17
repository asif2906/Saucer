# SAUCER — CRITICAL STABILIZATION PROJECT
## Production Bug Investigation, Root Cause Analysis and Complete Repair

You are now responsible for stabilizing an existing production SaaS application named SAUCER.

The application has undergone several development phases:

- Phase 1: Next.js application foundation.
- Priority 1: Supabase authentication and database.
- Priority 2: Gemini AI and AI credit ledger.
- Priority 3: Dodo Payments integration.
- Priority 4: Social media OAuth integrations.

Previous development reports claimed these phases were complete.

However, the actual production application is experiencing serious problems.

The owner reports that many features do not work, the application is full of bugs, newly created users can be taken into a demo account, and social account connections fail.

This means previous verification was insufficient.

Your responsibility is to identify the actual root causes and repair the application.

THIS IS NOT A NEW FEATURE DEVELOPMENT PHASE.

THIS IS A PRODUCTION STABILIZATION AND DEBUGGING PHASE.

---

# 1. ABSOLUTE RULES

1. Do not redesign the application.
2. Do not start developing additional features.
3. Do not generate more static placeholder screens.
4. Do not replace working systems unnecessarily.
5. Do not mark a feature complete merely because it compiles.
6. Do not treat mocked tests as real production verification.
7. Do not use fake user accounts in production.
8. Do not fake successful OAuth connections.
9. Do not fake successful publishing operations.
10. Do not use fabricated analytics as actual customer data.
11. Do not hardcode credentials.
12. Do not expose secrets in frontend code or logs.
13. Do not modify the production database destructively.
14. Do not push changes directly to the production branch without review.
15. Do not deploy unverified changes to production.

Preserve all existing customer data.

Create a dedicated stabilization branch.

Keep the current production deployment available for rollback.

Use a separate test environment and test accounts wherever possible.

---

# 2. FIRST TASK: PERFORM A COMPLETE APPLICATION AUDIT

Inspect the entire repository.

Read all existing architecture documents and implementation reports.

Do not trust previous completion claims without verifying the corresponding code.

Inspect:

- Every frontend page.
- Every reusable component.
- Every button and form.
- Every server action.
- Every API route.
- Every database query.
- Every middleware rule.
- Every Supabase integration.
- Every Prisma model.
- Every OAuth provider.
- Every AI endpoint.
- Every billing endpoint.
- Every webhook.
- Every background job.
- Every environment variable reference.

Run the application locally.

Run existing tests.

Inspect build output.

Inspect browser console errors.

Inspect failed network requests.

Inspect server logs.

Create:

PRODUCTION_BUG_INVENTORY.md

For every identified bug, document:

- Bug ID.
- Affected feature.
- User-visible symptoms.
- Steps to reproduce.
- Actual error.
- Root cause.
- Relevant source files.
- Required fix.
- Severity.
- Verification procedure.

Classify issues as:

P0 — Critical: authentication, data exposure, payment security, application unavailable.

P1 — Major: major features unusable.

P2 — Moderate: functionality partially broken.

P3 — Minor: UI defects and polish.

Do not begin a large-scale refactor before completing this inventory.

---

# 3. P0: FIX AUTHENTICATION FIRST

The owner reports that creating an account and subsequently logging in can redirect to a demo account.

Treat this as a critical production defect.

Trace the complete authentication lifecycle:

Registration → Supabase Auth → Email Verification → Session Creation → Middleware → Profile Lookup → Organization Lookup → Workspace Selection → Dashboard.

Inspect:

- Login page.
- Signup page.
- Authentication callbacks.
- Middleware.
- Supabase browser client.
- Supabase server client.
- Cookie handling.
- Profile lookup.
- Organization lookup.
- Workspace lookup.
- Redirect logic.
- Demo data.
- Mock user providers.
- Development fallback behavior.
- Environment configuration.

Remove demo-account substitution from all production authentication paths.

A missing profile must not silently cause a demo identity to be returned.

A missing workspace must trigger a safe provisioning or error-handling path.

Never substitute one customer's profile for another customer's profile.

Required tests:

1. Register User A.
2. Log in as User A.
3. Confirm the correct Auth user ID.
4. Confirm the correct Profile.
5. Confirm the correct Organization.
6. Confirm the correct Workspace.
7. Refresh the application.
8. Log out.
9. Register User B.
10. Log in as User B.
11. Confirm User B's data is independent.
12. Attempt cross-tenant data access.
13. Confirm access is denied.

Test in the actual Vercel Preview deployment.

Do not use hardcoded test identities in production.

---

# 4. P0: FIX PRODUCTION ENVIRONMENT CONFIGURATION

Audit every required environment variable.

Check:

- Supabase URL.
- Supabase publishable or anon key.
- Database connection string.
- Direct database connection URL.
- Gemini API key.
- Dodo API key.
- Dodo webhook signing key.
- OAuth application credentials.
- Social token encryption key.
- Application URL.
- OAuth redirect URLs.
- Background worker configuration.

Create:

PRODUCTION_ENV_AUDIT.md

For every variable, document:

- Name.
- Purpose.
- Required or optional.
- Referenced source files.
- Required Vercel environment.
- Whether it is configured.
- Which feature depends on it.

Do not print secret values.

Do not assume Preview and Production environments contain identical variables.

Do not copy, modify or expose any credential that was previously shared insecurely.

The owner must rotate exposed credentials before production use.

Do not automatically change existing production configuration.

---

# 5. P1: REPAIR ALL SOCIAL ACCOUNT CONNECTIONS

Audit every provider independently:

- Instagram.
- Facebook.
- LinkedIn.
- YouTube.
- Pinterest.

Trace:

Connect button → Authorization endpoint → Provider consent → OAuth callback → State verification → Token exchange → Token encryption → Database insertion → Account retrieval → Dashboard rendering.

Find exactly where each connection fails.

For every provider, check:

- Client ID.
- Client Secret.
- Redirect URI.
- Required API scopes.
- Developer application status.
- Provider permissions.
- Token exchange.
- OAuth state.
- PKCE where supported.
- Account discovery.
- Database persistence.
- Token refresh.
- Encryption and decryption.

Ensure provider-specific credentials are configured correctly.

Never use one user's access token as the global token for all customers.

Never return plaintext access tokens in API responses.

Create a connection diagnostics system that reports safe, understandable errors.

Examples:

- Missing provider configuration.
- Invalid redirect URI.
- Permission not approved.
- Authorization cancelled.
- Access token expired.
- Token refresh failed.
- Account type unsupported.

Test actual OAuth flows with developer-approved accounts.

Do not claim all integrations work merely because the authorization URL is generated.

---

# 6. P1: REPAIR THE POST COMPOSER

The composer must actually save and retrieve posts.

Test:

- Creating a text post.
- Adding images.
- Adding videos.
- Selecting social accounts.
- Platform-specific caption editing.
- Character validation.
- Preview generation.
- Saving a draft.
- Editing a draft.
- Deleting a draft.
- Loading existing posts.

Verify database persistence.

Refresh the browser and confirm that saved content remains available.

Verify organization and workspace access.

Ensure that platform-specific content is not accidentally overwritten by the master caption.

Do not use browser-only state as the source of truth.

---

# 7. P1: REPAIR SAUCER AI

Verify the actual Gemini integration.

Test:

- Caption generation.
- Hashtag generation.
- Rewriting.
- Multi-platform adaptation.
- Thread generation.
- Image understanding.
- Content calendar generation.

Check:

- Gemini API model identifier.
- API key configuration.
- Free-tier availability.
- Network response.
- Structured output parsing.
- Zod validation.
- Global quota controller.
- Credit reservation.
- Credit settlement.
- Credit refund.

Test with an actual Gemini API request.

Do not present simulated AI output as a real generated response.

Do not allow paid API fallback.

Ensure AI credits are not deducted for confirmed failed generations.

Ensure that a provider timeout with ambiguous completion is reconciled safely.

---

# 8. P1: REPAIR DODO PAYMENTS

Inspect the actual Dodo integration.

Test:

- Checkout session generation.
- Subscription activation.
- Subscription renewal.
- Upgrade.
- Downgrade.
- Cancellation.
- Payment failure.
- Refund.
- Billing portal.
- AI credit pack purchase.

Check webhook signature validation.

Check duplicate event handling.

Verify that frontend redirects never independently activate a paid subscription.

Verify that the database entitlement state is consistent with Dodo subscription events.

Ensure that the Free plan works without payment provider configuration.

Keep Dodo in test mode during stabilization.

Do not initiate live charges.

---

# 9. P2: REPAIR OTHER APPLICATION FEATURES

Audit every visible application route.

### Dashboard
Must display actual customer data.

### Calendar
Must display actual saved and scheduled posts.

### Social accounts
Must display connected accounts belonging to the current workspace.

### Publishing queue
Must show real job statuses.

### Analytics
Must display actual provider metrics or clearly indicate that data is unavailable.

### Workspaces
Must create, edit and switch actual workspaces.

### Team
Must enforce invitations, membership and permissions.

### Automations
Must display only implemented capabilities and persist configurations.

### Billing
Must show actual subscription and AI usage information.

Every visible button must perform an actual operation or be clearly marked unavailable.

Remove broken placeholder actions from production.

---

# 10. PRODUCTION-SAFE FEATURE MANAGEMENT

Until each feature is verified:

- Do not present it as production-ready.
- Disable unsupported operations.
- Show accurate error messages.
- Do not silently swallow errors.
- Record errors with useful correlation IDs.
- Do not expose secrets or personal information in error logs.

Implement a clear internal feature readiness matrix.

A feature may only receive the status PRODUCTION READY when an actual end-to-end user flow has passed.

---

# 11. TESTING REQUIREMENTS

Do not rely exclusively on unit tests.

Perform four categories of verification.

### Unit testing
Business logic, validation, authorization and state transitions.

### Integration testing
Supabase, Gemini, Dodo and provider API interactions.

### End-to-end testing
Real browser journeys.

### Production-equivalent testing
Vercel Preview with the correct environment configuration and separate test data.

For every fixed issue:

1. Reproduce the bug.
2. Capture its original failure.
3. Identify root cause.
4. Implement the correction.
5. Add a regression test.
6. Run the test.
7. Confirm the original failure no longer occurs.

Maintain:

STABILIZATION_TEST_RESULTS.md

---

# 12. REQUIRED USER JOURNEY

The most important test is one complete customer journey.

Simulate the following:

1. A new customer opens Saucer.
2. They register with their email.
3. They verify their email.
4. They log in.
5. They land in their own dashboard.
6. They create a workspace.
7. They open Saucer AI.
8. They generate an actual caption.
9. Their AI credits are correctly deducted.
10. They open the social account screen.
11. They connect an actual supported account using OAuth.
12. They create a post.
13. They save it as a draft.
14. The draft survives a page refresh.
15. They select a connected social account.
16. They submit an immediate publishing request when the publishing engine is available.

Do not claim successful publication unless the provider confirms it.

---

# 13. ACCEPTANCE CRITERIA

The stabilization project is not complete merely because:

- The build passes.
- TypeScript has no errors.
- Pages prerender successfully.
- Mock tests pass.

It is complete when actual customer-facing flows work.

At minimum:

- Authentication correctly identifies customers.
- No demo account appears in production.
- Organization isolation works.
- Database operations persist.
- Social OAuth works for providers with valid credentials and permissions.
- AI generation is real.
- AI credits are accurate.
- Dodo subscription data is accurate.
- Broken UI actions are fixed or disabled.
- Production secrets remain secure.

---

# 14. WORKING METHOD

Work in this exact order:

1. Production bug inventory.
2. Authentication root-cause analysis and repair.
3. Production environment correction.
4. Social OAuth diagnostics and repair.
5. Post composer persistence.
6. AI integration verification.
7. Dodo integration verification.
8. Remaining route repairs.
9. Full end-to-end regression suite.
10. Vercel Preview deployment.

Do not attempt a total rewrite.

Do not add advanced publishing features until the basic application works reliably.

Do not delete customer data.

Do not perform destructive database migrations.

Do not deploy untested changes to production.

Create a dedicated stabilization Git branch.

Commit meaningful fixes separately.

Only prepare a production deployment after the owner reviews the Preview results.

---

# 15. FINAL DELIVERABLES

Create:

- PRODUCTION_BUG_INVENTORY.md
- PRODUCTION_ENV_AUDIT.md
- AUTHENTICATION_ROOT_CAUSE_REPORT.md
- SOCIAL_OAUTH_DIAGNOSTICS.md
- APPLICATION_FUNCTIONALITY_AUDIT.md
- STABILIZATION_TEST_RESULTS.md
- STABILIZATION_REPORT.md

The final report must clearly distinguish:

- Actually fixed.
- Verified in a real external integration.
- Verified only with mocks.
- Blocked by missing credentials.
- Blocked by provider approval.
- Not implemented.
- Still broken.

Do not claim 100% completion without evidence.

BEGIN WITH THE AUTHENTICATION BUG.

Fix the actual production problems, not merely their appearance.
