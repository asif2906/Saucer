# SAUCER — Publishing Reliability, Fault Tolerance & Idempotency

## 1. Reliability Architecture
The publishing pipeline is built to handle platform network instability, rate limiting, token expiration, and asynchronous container delays without duplicate posts or orphaned jobs.

---

## 2. Error Classification: Transient vs Permanent

| Error Category | Indicators | Worker Behavior | Outcome State |
| :--- | :--- | :--- | :--- |
| **Transient Error** | HTTP 429 (Rate Limit), 503 Service Unavailable, 504 Gateway Timeout, Socket Reset | Computes exponential backoff delay, reschedules `nextRetryAt`, sets variant to `QUEUED` | `TRANSIENT_FAILURE` (Retryable) |
| **Permanent Error** | HTTP 401 Unauthorized, HTTP 400 Bad Request, Content Policy Rejection, Revoked Scopes | Halts retries immediately, marks job `FAILED`, creates user notification | `PERMANENT_FAILURE` (Fatal) |

---

## 3. Exponential Backoff Formula
For transient errors where `attemptCount < maxRetries` (default max 5 retries):
$$\text{delaySeconds} = \min\left(60 \times 2^{\text{attempt} - 1},\, 3600\right)$$

- Attempt 1: 60 seconds
- Attempt 2: 120 seconds (2 mins)
- Attempt 3: 240 seconds (4 mins)
- Attempt 4: 480 seconds (8 mins)
- Attempt 5: 960 seconds (16 mins)
- Capped at: 3,600 seconds (1 hour)

---

## 4. Ambiguous Network Timeout & Duplicate Post Prevention
If an HTTP request times out when communicating with Meta, LinkedIn, or YouTube:
1. The engine never blindly re-executes `POST` without reconciliation.
2. For platforms providing container / status inspection (`checkPostStatus` on Instagram or YouTube), the worker queries the provider status using the pending ID before dispatching a new insert.
3. If the post exists on the provider, it captures the `postId` and marks the job as `COMPLETED`.

---

## 5. Audit Logging (`PublishAttempt`)
Every single publishing attempt records:
- `jobId`: Relation to `PublishJob`
- `attemptNumber`: Incremental attempt counter
- `startedAt` & `completedAt`: Precise microsecond timestamps
- `outcome`: `SUCCESS`, `TRANSIENT_FAILURE`, or `PERMANENT_FAILURE`
- `providerErrorCode`: Platform-specific error code (e.g. `100`, `429`, `INVALID_GRANT`)
- `safeErrorMessage`: Sanitized error text safe for customer visibility
- `externalResponseId`: Provider-confirmed post ID or URN
