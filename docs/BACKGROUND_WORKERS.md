# SAUCER — Background Worker & Inngest Architecture

## 1. Managed Worker Architecture Evaluation
Saucer utilizes **Inngest** as its primary managed background workflow solution.

### Inngest Evaluation Criteria:
1. **Serverless on Vercel**: Integrates directly via Next.js App Router (`src/app/api/inngest/route.ts`).
2. **No Persistent Node.js Process**: Eliminates the operational burden, memory leakage, and cost of maintaining a continuously running daemon (e.g. EC2/VPS worker or PM2).
3. **No Self-Managed Redis Required**: Workflows, durable steps, sleep schedules, and retries are managed by Inngest's event-driven mesh.
4. **Free-Tier Limits**: 50,000 steps/month free, providing ample capacity for scheduling and broadcasting without unexpected infrastructure bills ($0.00).
5. **PostgreSQL as Authoritative Source**: PostgreSQL retains the complete record of posts, variants, scheduled jobs, attempts, and audit logs. If an Inngest event is interrupted, PostgreSQL retains the ground truth.

---

## 2. Inngest Function Definitions

### `scheduledPublishWorkflow` (`saucer/post.scheduled`)
- Triggered whenever a post is scheduled.
- Step 1: `step.sleepUntil("wait-for-schedule", scheduledAt)`.
- Step 2: Queries active pending jobs from PostgreSQL.
- Step 3: Invokes `PublishExecutor.executeJob(jobId)` for each platform variant.

### `schedulerReconciliationCron` (Every 5 minutes)
- Runs `PublishingService.runDueJobReconciliation(25)`.
- Scans for any pending jobs where `scheduledAt <= now()` that were not processed due to serverless cold starts, deployment restarts, or network timeouts.

---

## 3. Worker Concurrency & Idempotency
- **Unique Idempotency Keys**: Every `PublishJob` contains a unique `idempotencyKey` (`job_{variantId}_{timestamp}_{random}`).
- **Database Unique Constraint**: Prevents duplicate job creation even if webhook or event delivery is duplicated.
- **Pre-execution Check**: `PublishExecutor` verifies if `PostVariant.status === 'PUBLISHED'` and `externalPostId` is present before making external HTTP requests.
