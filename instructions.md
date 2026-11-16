# SAUCER — PRIORITY 5: SCHEDULING & RELIABLE SOCIAL PUBLISHING ENGINE

Priority 1: Supabase — implemented.
Priority 2: Saucer AI — implemented.
Priority 3: Dodo Payments — implemented.
Priority 4: Social account integrations — implemented according to the verification report.

We are now building the complete social media publishing and scheduling engine.

This is a critical production feature.

The objective is to allow Saucer customers to create content, publish immediately, schedule posts for future dates, publish to multiple platforms, track publishing outcomes and recover from failures.

Do not treat this as a simple cron job.

## 1. FIRST: AUDIT EXISTING IMPLEMENTATION

Inspect the complete existing Saucer codebase.

Read:
- ARCHITECTURE.md
- DATABASE_SCHEMA.md
- SOCIAL_INTEGRATIONS.md
- SOCIAL_INTEGRATION_PHASE_4_REPORT.md
- API_DOCUMENTATION.md
- SECURITY.md
- DEPLOYMENT_GUIDE.md
- FEATURE_PARITY_MATRIX.md

Inspect every existing social provider and its current publishing method.

Do not unnecessarily rewrite working provider integrations.

Identify what already exists and what remains missing.

## 2. API VERSION CORRECTIONS

Before implementing scheduling:

- Audit Meta Graph API version usage. The existing v21.0 implementation must be upgraded after checking current compatible versions and endpoints.
- Make Meta Graph API version configurable.
- Ensure LinkedIn uses a currently supported Marketing API version. The October 2026 version is 202610.
- Correct YouTube video-upload quota accounting. The `videos.insert` method now uses a separate upload quota bucket; do not retain the obsolete 1,600-unit assumption.
- Read current official platform documentation.

Update documentation accordingly.

## 3. DATABASE DESIGN

Inspect existing Prisma models before adding new ones.

Implement or extend:

### Post

Store:
- Organization ID.
- Workspace ID.
- Created by.
- Post content.
- Post type.
- Status.
- Created timestamp.
- Updated timestamp.
- Scheduled timestamp.
- Timezone.

### PostVariant

Stores platform-specific content.

Fields should include:
- Post ID.
- Social account ID.
- Platform.
- Caption or text.
- Media configuration.
- Platform-specific metadata.
- Publishing status.
- External post ID.
- Published timestamp.

### PublishJob

Tracks the execution of a publishing operation.

Include:
- Post variant ID.
- Scheduled time.
- Job status.
- Attempt count.
- Next retry time.
- Idempotency key.
- Worker event ID.
- Created timestamp.
- Completed timestamp.

### PublishAttempt

Maintain an auditable record of each publishing attempt.

Include:
- Job ID.
- Attempt number.
- Start time.
- Completion time.
- Outcome.
- Provider error code.
- Safe error message.
- External response ID.

Do not duplicate existing fields if suitable models already exist.

Add proper database indexes and constraints.

## 4. POST LIFECYCLE

Implement these clear states:

- DRAFT
- SCHEDULED
- QUEUED
- PUBLISHING
- PUBLISHED
- PARTIALLY_PUBLISHED
- FAILED
- CANCELLED

A multi-platform post must track each platform independently.

For example:

A post targeting Instagram, Facebook and LinkedIn may succeed on Instagram and Facebook but fail on LinkedIn.

The system must accurately represent this as a partial success, rather than incorrectly marking the entire post as either fully published or completely failed.

## 5. BACKGROUND WORKER ARCHITECTURE

Evaluate Inngest as our primary managed background workflow solution.

Important requirements:
- Check its current free-tier limits.
- Use its supported Vercel integration.
- Do not require a permanently running Node.js process.
- Do not require a self-managed Redis server if Inngest can handle the required workflow.
- Keep PostgreSQL as the authoritative source of scheduled posts and publishing results.
- Use persistent workflow execution and retry capabilities.

If Inngest is unsuitable for a particular operation, document alternatives before implementing them.

Do not use browser-based scheduling or rely on the user keeping the browser open.

Never execute long-running social publishing operations directly inside a normal Vercel HTTP request.

## 6. SCHEDULING ENGINE

Implement:

- Immediate publishing.
- Schedule for a specific date and time.
- Daily and weekly recurring schedules where appropriate.
- Timezone-aware scheduling.
- Post editing.
- Rescheduling.
- Cancellation.
- Queue management.

Store scheduled timestamps in UTC and preserve the customer's IANA timezone.

Handle:
- Daylight saving time.
- Timezone conversion.
- Past scheduling dates.
- Duplicate jobs.
- Application deployment during pending jobs.
- Worker failures.
- Job recovery.

Editing or cancelling a scheduled post must correctly update or invalidate its previously scheduled execution.

A stale job must never publish an outdated version of a post.

## 7. PUBLISHING PIPELINE

For every scheduled platform-specific variant:

1. Load the post and destination account.
2. Verify the organization and workspace authorization.
3. Verify the social account is connected.
4. Check token validity.
5. Refresh tokens when supported.
6. Validate platform-specific content constraints.
7. Validate media requirements.
8. Execute the appropriate provider publishing operation.
9. Poll asynchronous media processing when required.
10. Store the provider's external post ID.
11. Record success or failure.
12. Update aggregate post status.
13. Notify the customer where appropriate.

Never report a post as published until the provider has actually confirmed success.

## 8. RELIABILITY AND IDEMPOTENCY

Implement:

- Unique publishing idempotency keys.
- Duplicate job prevention.
- Safe retries.
- Exponential backoff.
- Platform rate-limit handling.
- Retry-After support.
- Token expiration recovery.
- Job timeout handling.
- Stale job detection.
- Manual retry.
- Permanent failure classification.

Important:

Do not blindly retry an operation after an ambiguous network timeout if the external platform may already have published the post.

Use provider post IDs or reconciliation mechanisms when available to prevent duplicate posts.

## 9. MEDIA PROCESSING

Support appropriate platform-specific media workflows:

- Image uploads.
- Video uploads.
- Instagram media containers.
- Carousel creation.
- Reels processing.
- Facebook Page publishing.
- LinkedIn media uploads.
- YouTube resumable video uploads.
- Pinterest media requirements.

Respect maximum file sizes, formats, processing states and media restrictions.

Use Supabase Storage initially.

Use signed URLs and ensure the relevant provider can access media files where required.

Do not assume every platform supports every media format.

## 10. FRONTEND INTEGRATION

Connect the existing frontend to the real publishing engine.

### Post Composer

Implement:
- Save draft.
- Publish now.
- Schedule.
- Select multiple destination accounts.
- Edit each platform's post variant.
- Validate content before submission.
- Show platform-specific publishing status.

### Calendar

Implement:
- Real database-backed posts.
- Day, week and month views.
- Scheduled content.
- Drafts.
- Published posts.
- Failed posts.
- Drag-and-drop rescheduling.
- Filters by platform and social account.

### Publishing Queue

Implement:
- Upcoming posts.
- Publishing in progress.
- Successful posts.
- Failed posts.
- Retry action.
- Cancel action.
- Edit action.

### Publishing History

Display:
- Publication date.
- Destination platform.
- External post reference.
- Publishing status.
- Error details when applicable.

## 11. CUSTOMER NOTIFICATIONS

Create notification functionality for:
- Successful publication.
- Failed publication.
- Token expiration.
- Reconnection requirements.
- Retry outcomes.

Never send duplicate notifications for the same event.

## 12. SECURITY

Ensure:
- Server-side organization authorization.
- Workspace access validation.
- Encrypted tokens.
- No frontend token exposure.
- Secure worker authentication.
- Webhook and job event validation.
- Rate limiting.
- Audit logging.
- Secure media access.

Every publishing job must be associated with an authorized organization and workspace.

## 13. TESTING

Test the following:

1. Immediate single-platform publishing.
2. Immediate multi-platform publishing.
3. Scheduling for a future date.
4. Editing a scheduled post.
5. Cancelling a scheduled post.
6. Correct timezone conversion.
7. Recurring publishing.
8. Duplicate event delivery.
9. Worker retry after temporary failure.
10. Permanent provider failure.
11. Expired social token.
12. Token refresh.
13. Partial success across multiple platforms.
14. Media processing failure.
15. Application restart while scheduled jobs are pending.
16. Concurrent publishing requests.
17. Unauthorized cross-organization publishing.
18. Provider quota exhaustion.
19. Manual retry.
20. Post version change before execution.

Use mocks for unit testing.

Additionally, perform real end-to-end publishing tests using developer-approved accounts wherever possible.

Clearly classify all results as:
- Mocked.
- Local integration.
- Real developer-app OAuth.
- Real successful publication.
- Production-approved.

Do not claim real posting functionality based solely on mocked API responses.

## 14. DOCUMENTATION

Create:

PUBLISHING_ENGINE.md
SCHEDULING_SYSTEM.md
BACKGROUND_WORKERS.md
PUBLISHING_RELIABILITY.md
MEDIA_PROCESSING.md
PRIORITY_5_VERIFICATION_REPORT.md

Update:
- ARCHITECTURE.md
- DATABASE_SCHEMA.md
- API_DOCUMENTATION.md
- SECURITY.md
- TESTING.md
- FEATURE_PARITY_MATRIX.md

## 15. EXECUTION INSTRUCTIONS

Work incrementally.

First complete the architecture and version audit.

Then implement database models.

Then implement the worker and scheduler.

Then integrate the composer, calendar and queue.

Finally execute the testing suite.

Preserve all existing Supabase, Gemini, Dodo and OAuth functionality.

Do not deploy publicly.

Do not activate paid services.

Do not silently exceed any free-tier limits.

At the end, generate a complete verification report showing exactly which platforms have successfully published a real test post and which are still awaiting permissions or credentials.

Begin Priority 5.