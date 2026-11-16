# SAUCER — AI-Powered Social Media Management SaaS

[![Status](https://img.shields.io/badge/Milestone-1%20Audit%20Complete-green.svg)](#)
[![License](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](#)
[![Architecture](https://img.shields.io/badge/Stack-Next.js%20%7C%20NestJS%20%7C%20Supabase%20%7C%20Gemini-purple.svg)](#)

---

## 1. Project Overview

**Saucer** is an all-in-one, enterprise-grade AI-powered social media management SaaS platform designed for content creators, high-growth startups, enterprises, and marketing agencies. Saucer centralizes multi-network social media publishing, visual calendar scheduling, durable background workflow execution, advanced AI content generation (powered by Google Gemini), multi-brand workspace collaboration, and performance analytics into a single modern dashboard.

Saucer references the comprehensive capabilities of the open-source **Postiz** platform while engineering an independent, modern, secure, and production-ready commercial SaaS experience.

---

## 2. Core Capabilities & Architecture

- **Unified Multi-Network Composer**: Draft once and tailor content individually across 38+ social platforms with real-time live previews, rich media processing, character count validations, and platform-specific metadata.
- **Visual Content Calendar**: Interactive monthly, weekly, and daily grid views supporting drag-and-drop rescheduling, automated queue slots, and comprehensive timezone-aware publishing.
- **Resilient Publishing Engine**: Durable background workflow execution featuring automatic token refresh, provider rate-limit throttling, heartbeat timeouts, duplicate publishing prevention, and traceable failure diagnostics.
- **Saucer AI Studio**: Proprietary backend-managed integration with Google Gemini (Flash & Pro), providing caption generation, viral hooks, multi-post thread synthesis, tone rewriting, and platform-specific adaptation without requiring users to supply their own API keys.
- **Auditable AI Credit Ledger**: Server-side, two-phase reservation and settlement engine preventing concurrent double-spends and enforcing monthly tier quotas.
- **Multi-Tenant Workspaces**: Strict organization-level data isolation, role-based access control (RBAC), client brand segmentation, and team approval workflows.
- **SaaS Subscription Infrastructure**: Commercial monetization engine built with Dodo Payments Checkout Sessions, webhook idempotency, and fine-grained feature entitlement gating.
- **Modern Design System**: Polished, minimal, and responsive frontend interface built with Next.js (App Router), Tailwind CSS, shadcn/ui, and Lucide icons.

---

## 3. Technology Stack

| Layer | Primary Technology | Architectural Role |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16 / React 19** | Modern App Router UI, Server Components, client state via Zustand, rich text via TipTap |
| **Design System** | **Tailwind CSS + shadcn/ui** | Modern, accessible, responsive SaaS interface with Lucide iconography |
| **Backend API** | **NestJS 11** | Modular service architecture, REST APIs, public v1 endpoints, CASL authorization guards |
| **Database** | **Supabase PostgreSQL 17** | Managed relational store with Prisma ORM, connection pooling via Supavisor |
| **Orchestration** | **Temporal / Durable Workers** | Long-running workflows, scheduled sleeping, heartbeat detection, per-provider activity queues |
| **Cache & Throttling** | **Redis (IoRedis / Upstash)** | API rate-limiting, session synchronization, distributed locks |
| **Artificial Intelligence** | **Google Gemini API** | Gemini 2.5 Flash / Pro models behind a modular server-side abstraction layer |
| **Media Storage** | **Cloudflare R2 / Supabase Storage** | S3-compatible asset store, chunked uploads, image optimization via Sharp |
| **Payment Gateway** | **Dodo Payments** | Checkout Sessions, recurring subscriptions, customer portal, test_mode development |

---

## 4. Master Documentation Index

All architectural blueprints, technical specifications, and operating manuals for Saucer are maintained in the following dedicated documents:

1. [ARCHITECTURE.md](file:///c:/Users/check/Desktop/saucer/ARCHITECTURE.md) — Comprehensive technical architecture, service topology, and workflow orchestration.
2. [DATABASE_SCHEMA.md](file:///c:/Users/check/Desktop/saucer/DATABASE_SCHEMA.md) — Relational models, Prisma schema audit, migration strategy, and multi-tenant constraints.
3. [API_DOCUMENTATION.md](file:///c:/Users/check/Desktop/saucer/API_DOCUMENTATION.md) — Full REST API catalog covering internal routes and the developer Public API v1.
4. [SOCIAL_INTEGRATIONS.md](file:///c:/Users/check/Desktop/saucer/SOCIAL_INTEGRATIONS.md) — Exhaustive inventory of 38 social providers, OAuth flows, and publishing mechanics.
5. [AI_SYSTEM.md](file:///c:/Users/check/Desktop/saucer/AI_SYSTEM.md) — Google Gemini architecture, prompt design, structured outputs, and provider abstraction.
6. [AI_CREDIT_SYSTEM.md](file:///c:/Users/check/Desktop/saucer/AI_CREDIT_SYSTEM.md) — Two-phase reservation/commit credit ledger, concurrency handling, and reset automation.
7. [SUBSCRIPTION_SYSTEM.md](file:///c:/Users/check/Desktop/saucer/SUBSCRIPTION_SYSTEM.md) — Dodo Payments subscription lifecycle, plan tiers, customer portal, and CASL policy enforcement.
8. [DEPLOYMENT_GUIDE.md](file:///c:/Users/check/Desktop/saucer/DEPLOYMENT_GUIDE.md) — Hybrid hosting topology (Vercel + Persistent Workers + Supabase).
9. [ENVIRONMENT_VARIABLES.md](file:///c:/Users/check/Desktop/saucer/ENVIRONMENT_VARIABLES.md) — Complete environment variable catalog with security classifications.
10. [SECURITY.md](file:///c:/Users/check/Desktop/saucer/SECURITY.md) — Threat modeling, token encryption at rest, SSRF prevention, and tenant boundaries.
11. [TESTING.md](file:///c:/Users/check/Desktop/saucer/TESTING.md) — QA test framework, unit/integration test setup, and the 17 verified user journeys.
12. [LICENSING_AND_ATTRIBUTION.md](file:///c:/Users/check/Desktop/saucer/LICENSING_AND_ATTRIBUTION.md) — AGPLv3 compliance analysis and third-party notices.
13. [IMPLEMENTATION_ROADMAP.md](file:///c:/Users/check/Desktop/saucer/IMPLEMENTATION_ROADMAP.md) — 10-Milestone engineering roadmap and complexity estimates.
14. [FEATURE_PARITY_MATRIX.md](file:///c:/Users/check/Desktop/saucer/docs/saucer/FEATURE_PARITY_MATRIX.md) — Live feature tracking matrix comparing Postiz with Saucer.

---

## 5. Development Principles & Rules of Engagement

1. **Untouched Reference**: The original Postiz source archive (`postiz-app-main.zip`) remains pristine. All research is conducted non-destructively.
2. **Incremental Development**: Work proceeds milestone by milestone. Code is verified with tests prior to advancing.
3. **No Blind Rewrites**: Proven social media integration drivers and rate-limiting patterns are preserved and refined rather than discarded.
4. **Zero-Trust Security**: No client is trusted for authorization, feature limits, or credit balance calculation. All limits are enforced server-side.
5. **Real-World Integrity**: Mocked responses are explicitly noted during automated testing; live publishing claims require authenticated credentials.

