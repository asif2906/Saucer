# SAUCER — PHASED IMPLEMENTATION ROADMAP

This document outlines the phased engineering roadmap for **Saucer**, structured across **10 development milestones** with technical complexity estimates, dependency sequencing, and operational risk assessments.

---

## 1. Roadmap Overview & Timeline

```mermaid
flowchart LR
    M1["M1: Repository Audit<br/>(Current - Complete)"] --> M2["M2: Saucer Workspace Setup"]
    M2 --> M3["M3: Brand & Frontend UI"]
    M3 --> M4["M4: Core SaaS Features"]
    M4 --> M5["M5: Publishing Engine"]
    M5 --> M6["M6: Saucer AI & Credits"]
    M6 --> M7["M7: Dodo Payments Subscriptions"]
    M7 --> M8["M8: Analytics & Teams"]
    M8 --> M9["M9: Security & QA (17 Journeys)"]
    M9 --> M10["M10: Production Launch"]
```

---

## 2. Milestone Breakdown & Technical Deliverables

### MILESTONE 1 — REPOSITORY AUDIT (CURRENT — COMPLETED)
- **Primary Objective**: Thoroughly inspect provided Postiz reference source ZIP, map architecture, database schema, background jobs, social integrations, AI systems, and legal obligations.
- **Deliverables**:
  - Full codebase audit report and master documentation suite.
  - Complete `FEATURE_PARITY_MATRIX.md`.
  - Concrete target architecture and database migration strategy.
- **Complexity**: Low-Medium | **Status**: **COMPLETE**

---

### MILESTONE 2 — SAUCER PROJECT SETUP & MONOREPO HYGIENE
- **Primary Objective**: Establish the independent Saucer development repository, clean unneeded legacy Gitroom marketplace files, and configure modern build tooling.
- **Key Tasks**:
  - Initialize clean Git repository (`saucer`) with untouched original ZIP preserved.
  - Setup PNPM monorepo workspaces (`apps/frontend`, `apps/backend`, `apps/orchestrator`, `libraries/*`).
  - Configure `docker-compose.dev.yaml` for local development (PostgreSQL 17, Redis 7, Temporal).
  - Prune legacy Gitroom marketplace models and dependencies (`GitHub`, `Trending`, `Orders`).
  - Generate pristine Prisma client from target schema.
- **Complexity**: Medium | **Estimated Duration**: 3–5 Days

---

### MILESTONE 3 — FRONTEND DESIGN SYSTEM & BRANDING
- **Primary Objective**: Build an original, modern, high-density SaaS interface for Saucer.
- **Key Tasks**:
  - Configure Tailwind CSS, CSS variables, and `shadcn/ui` component primitives with Lucide icons.
  - Implement 15 core application screens:
    1. Landing Page & Product Showcase
    2. Authentication & Password Recovery
    3. User Onboarding & Organization Setup
    4. Main Executive Dashboard
    5. Connected Social Accounts Manager
    6. Centralized Multi-Platform Post Composer (TipTap)
    7. Visual Content Calendar (Month, Week, Day views)
    8. Saucer AI Content Studio
    9. Cross-Platform Analytics Dashboard
    10. Workspaces & Brand Switcher
    11. Team Members & Roles Management
    12. Subscription & Invoicing Portal
    13. User Profile Settings
    14. Organization Settings
    15. Superadmin Management Console
- **Complexity**: High | **Estimated Duration**: 7–10 Days

---

### MILESTONE 4 — CORE SAAS APPLICATION
- **Primary Objective**: Implement foundational multi-tenant data structures, user sessions, channel management, and draft saving.
- **Key Tasks**:
  - User registration, login, JWT cookie handling, and Resend email verification.
  - Organization provisioning and workspace member invitation workflows.
  - Social channel connection flows (OAuth handshakes for Tier-1 platforms: X, LinkedIn, Meta, YouTube).
  - Multi-platform post composer logic with network-specific character count validation.
  - Draft persistence and visual calendar query endpoints.
- **Complexity**: High | **Estimated Duration**: 7–10 Days

---

### MILESTONE 5 — PUBLISHING ENGINE & WORKFLOW ORCHESTRATION
- **Primary Objective**: Establish durable background scheduling, rate-limit throttling, automatic token refresh, and failure recovery.
- **Key Tasks**:
  - Temporal workflow orchestrator setup with deterministic post workflow (`postWorkflowV112`).
  - Provider-specific activity queues (`x`, `linkedin`, `facebook`, `instagram`, `youtube`, `tiktok`).
  - Heartbeat timeout monitoring (15s heartbeat interval, 3-minute timeout).
  - Pre-flight OAuth token refresh and `RefreshToken` exception handling.
  - Recurring / Evergreen interval rescheduling.
  - End-to-end publishing tests with simulated provider failures and retries.
- **Complexity**: Very High | **Estimated Duration**: 10–14 Days

---

### MILESTONE 6 — SAUCER AI CONTENT STUDIO & CREDIT LEDGER
- **Primary Objective**: Deliver a zero-friction, server-side Google Gemini integration backed by an atomic two-phase credit ledger.
- **Key Tasks**:
  - Build `GeminiAiProvider` utilizing `gemini-2.5-flash` and `gemini-2.5-pro`.
  - Implement structured output schemas (captions, hashtags, thread generator, tone rewriter, cross-platform adaptation).
  - Implement two-phase reservation and settlement engine in `CreditService` (preventing concurrent double-spends).
  - Multi-modal vision analysis (image-to-caption and automated accessibility alt-text).
  - Monthly allowance enforcement and automated reset scheduler.
- **Complexity**: High | **Estimated Duration**: 7–10 Days

---

### MILESTONE 7 — SAAS SUBSCRIPTIONS & DODO PAYMENTS INTEGRATION
- **Primary Objective**: Implement automated recurring monetization in Dodo Payments test_mode.
- **Key Tasks**:
  - Configure Dodo Payments Checkout Sessions for Free, Pro, and Agency tiers, plus one-time AI credit packs.
  - Implement `POST /api/v1/billing/dodo/webhook` with cryptographic signature verification and idempotency locks.
  - Integrate Dodo Customer Portal for self-service payment method updates, invoice downloads, and cancellations.
  - Integrate CASL policy checks (`PermissionsService`) enforcing active channel caps, post quotas, and AI credits.
- **Complexity**: High | **Estimated Duration**: 5–7 Days

---

### MILESTONE 8 — ADVANCED SAAS CAPABILITIES
- **Primary Objective**: Elevate product with analytics, agency collaboration, and automations.
- **Key Tasks**:
  - Social API analytics ingestion (impressions, reach, likes, comments, shares).
  - Content approval workflows for agency teams (Editor drafts -> Admin approves).
  - RSS feed autoposting engine.
  - Public Developer REST API v1 with API key authentication.
  - Official Saucer Model Context Protocol (MCP) server for Claude and Cursor.
- **Complexity**: Medium-High | **Estimated Duration**: 7–10 Days

---

### MILESTONE 9 — PRODUCTION READINESS, HARDENING & QA
- **Primary Objective**: Comprehensive security audit, penetration defense, performance optimization, and verification of all 17 user journeys.
- **Key Tasks**:
  - Token encryption at rest (AES-256-GCM verification).
  - SSRF protection audit on all outbound URL endpoints.
  - Multi-tenant data isolation testing across organizations.
  - End-to-end automated testing of the **17 User Journeys** (specified in `TESTING.md`).
  - Sentry APM integration and load testing.
- **Complexity**: High | **Estimated Duration**: 5–7 Days

---

### MILESTONE 10 — PRODUCTION LAUNCH
- **Primary Objective**: Execute deployment across production environments upon explicit approval.
- **Key Tasks**:
  - Supabase production cluster provisioning (Supavisor pooler on port 6543).
  - Persistent compute worker deployment (Railway / AWS ECS).
  - Vercel frontend deployment with custom production domain (`saucer.tech`).
  - Production OAuth app approvals and live Dodo Payments activation.
- **Complexity**: Medium | **Estimated Duration**: 3–5 Days

---

> [!IMPORTANT]
> **MILESTONE 1 STOP**: In compliance with instructions, development stops immediately upon completion of this audit. Application-code changes and repository commits await review and formal approval.

