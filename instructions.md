# SAUCER — PRIORITY 3: DODO PAYMENTS INTEGRATION

Priority 1 (Supabase) and Priority 2 (Gemini AI and Credit Ledger) have been implemented.

Now implement the complete Dodo Payments integration.

Read:
- SUBSCRIPTION_SYSTEM.md
- AI_CREDIT_SYSTEM.md
- DATABASE_SCHEMA.md
- API_DOCUMENTATION.md
- SECURITY.md
- DEPLOYMENT_GUIDE.md

## 1. PAYMENT PROVIDER

Use Dodo Payments exclusively.

Use its current official SDK and documentation.

Use Checkout Sessions for new checkout integrations.

Initially configure test mode only.

Do not introduce Razorpay or any other payment provider.

## 2. SUBSCRIPTION PLANS

Implement configurable:

- Free
- Pro
- Agency
- Enterprise

Plans must control:
- Connected social account limits.
- Workspace limits.
- Team member limits.
- Scheduling allowances.
- AI monthly credit allowances.
- Analytics access.
- Advanced feature access.

Subscription configuration must be stored and managed server-side.

Never trust frontend plan identifiers or prices.

## 3. CHECKOUT

Implement:
POST /api/billing/checkout-session

Support:
- New subscriptions.
- Plan upgrades.
- Plan downgrades.
- One-time AI credit purchases.

Store provider customer and subscription identifiers securely.

## 4. WEBHOOKS

Implement a secure webhook receiver.

Requirements:
- Verify webhook signatures.
- Validate event payloads.
- Record event IDs.
- Handle duplicate deliveries idempotently.
- Process subscription-created events.
- Process subscription-updated events.
- Process subscription-cancelled events.
- Process payment-success events.
- Process payment-failure events.
- Process refunds where applicable.

Do not activate subscriptions based solely on a checkout success redirect.

## 5. AI CREDIT INTEGRATION

Integrate subscription renewals with Saucer's existing AI credit ledger.

On each verified billing-period renewal:
- Allocate the appropriate plan allowance.
- Create immutable allocation ledger entries.
- Preserve eligible purchased credit balances.
- Prevent duplicate allocations.
- Apply correct billing-cycle boundaries.

One-time credit purchases must only grant credits after verified payment events.

Never allow Dodo webhooks to overwrite arbitrary credit balances.

## 6. CUSTOMER BILLING PORTAL

Implement server-side creation of customer billing portal sessions.

Allow customers to:
- View their subscription.
- Update subscription where supported.
- Cancel subscriptions.
- View billing history.
- Manage payment methods where supported.

## 7. SECURITY

- Keep Dodo API keys server-side.
- Verify webhook signatures.
- Implement event idempotency.
- Validate amounts and currency.
- Never trust browser-supplied payment status.
- Protect customer billing data.
- Do not expose provider credentials.

## 8. TESTING

Test:
- Successful checkout.
- Invalid checkout request.
- Subscription creation.
- Subscription renewal.
- Subscription cancellation.
- Duplicate webhook delivery.
- Failed payment.
- Refund.
- One-time credit purchase.
- Duplicate credit allocation prevention.
- Plan upgrade.
- Plan downgrade.
- Expired subscription access.

Use Dodo test mode.

## 9. DELIVERABLES

Update:
- SUBSCRIPTION_SYSTEM.md
- DATABASE_SCHEMA.md
- API_DOCUMENTATION.md
- SECURITY.md
- TESTING.md
- DEPLOYMENT_GUIDE.md

Create DODO_PHASE_3_REPORT.md.

Do not enable live payment mode or deploy publicly without approval.

Complete the actual implementation and tests, not merely UI screens.