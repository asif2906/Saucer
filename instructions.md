# SAUCER — PHASE 1: WEB APPLICATION DEVELOPMENT

You are now moving from project planning into active software development.

You have already inspected the Postiz source code and generated project documentation.

The product we are developing is SAUCER, an AI-powered social media management SaaS.

Your immediate responsibility is to create the first working version of the Saucer web application.

This is an actual software implementation task, not a design proposal.

## 1. READ THE EXISTING DOCUMENTATION FIRST

Before modifying files, read all existing Markdown documentation, especially:

- ARCHITECTURE.md
- DATABASE_SCHEMA.md
- FEATURE_PARITY_MATRIX.md
- AI_SYSTEM.md
- AI_CREDIT_SYSTEM.md
- AI_PROVIDER_ARCHITECTURE.md
- AI_QUOTA_MANAGEMENT.md
- SUBSCRIPTION_SYSTEM.md
- DEPLOYMENT_GUIDE.md
- IMPLEMENTATION_ROADMAP.md
- LICENSING_AND_ATTRIBUTION.md

Discover the actual filenames if they differ.

Treat the latest approved Saucer decisions as authoritative.

Confirmed decisions:

- Product name: SAUCER.
- Reference product: Postiz.
- Target: Broad functional parity with Postiz.
- Frontend: Next.js.
- Language: TypeScript.
- UI: Tailwind CSS and shadcn/ui.
- Database: Supabase PostgreSQL.
- ORM: Prisma.
- Frontend hosting: Vercel.
- AI provider: Google Gemini API, free tier only initially.
- Payment provider: Dodo Payments only.
- File storage: Supabase Storage initially.
- No Oracle Cloud.
- No Razorpay.
- No mandatory BYOK system.
- No automatic paid AI API fallback.
- No unapproved paid infrastructure.

Do not silently overwrite decisions documented in the approved architecture.

If the documentation contains contradictions, record them in DECISIONS_NEEDED.md and explain the impact before proceeding.

## 2. CREATE THE SAUCER APPLICATION

Create a clean, maintainable project structure for Saucer.

Use the approved repository structure wherever possible.

The application should use:

- Next.js App Router.
- React.
- TypeScript strict mode.
- Tailwind CSS.
- shadcn/ui.
- Lucide icons.
- Supabase integration.
- Prisma for server-side relational database access.
- Zod for validation.

Prefer reusable components, modular code and well-defined application boundaries.

Do not create unnecessary microservices.

Do not introduce Docker, Redis, Temporal or Inngest into the frontend application unless the current architecture requires them.

Keep long-running publishing workflows separate from the Vercel frontend.

## 3. SAUCER BRAND IDENTITY

Brand name: Saucer.

Suggested brand presentation:

SAUCER.

Brand concept:
A centralized orbit for social media management.

Create an original visual identity.

Design direction:

- Premium SaaS.
- Minimal and modern.
- Professional.
- Elegant typography.
- Clean spacing.
- Subtle gradients.
- Thoughtful transitions.
- Consistent iconography.
- Responsive design.
- Excellent accessibility.

Create a distinctive Saucer logo/wordmark using an original design.

Do not use Postiz logos, names, proprietary artwork or copied branding.

Create reusable design tokens for:

- Primary colors.
- Secondary colors.
- Backgrounds.
- Borders.
- Typography.
- Radius.
- Shadows.
- Spacing.
- Light theme.
- Dark theme.

Make the interface visually consistent across every route.

## 4. PUBLIC LANDING PAGE

Build the main public website at `/`.

Required sections:

1. Navigation bar.
2. Hero section.
3. Product introduction.
4. Social media integration showcase.
5. Feature overview.
6. AI-powered content creation section.
7. Scheduling demonstration.
8. Analytics showcase.
9. Subscription plan preview.
10. FAQ section.
11. Footer.

Hero heading:

"Your entire social presence. One platform."

Supporting description:

"Create, schedule, publish and manage all your social media from one powerful workspace, powered by Saucer AI."

Primary CTA:
"Get Started"

Secondary CTA:
"Explore Features"

Create original illustrations or interface mockups where useful.

The marketing website should be fast, responsive and SEO-friendly.

Do not invent customer testimonials, fabricated usage statistics or unsupported integration claims.

## 5. AUTHENTICATION

Create:

- `/login`
- `/signup`
- `/forgot-password`
- `/onboarding`

Use Supabase Auth.

Implement:

- Email and password registration.
- Login.
- Logout.
- Session management.
- Email verification.
- Password reset.
- Protected application routes.
- User profile.

Use secure server-side session handling.

Use the appropriate Supabase SSR integration for Next.js.

Never expose Supabase service-role credentials in browser code.

## 6. APPLICATION DASHBOARD

Create the authenticated application under `/app`.

Build a premium dashboard layout with:

### Sidebar navigation

- Overview.
- Calendar.
- Create Post.
- Social Accounts.
- Publishing Queue.
- AI Studio.
- Analytics.
- Workspaces.
- Team.
- Automations.
- Settings.

### Top navigation

- Workspace selector.
- Search.
- Notifications.
- AI credit balance.
- User profile menu.

### Dashboard overview

Include:

- Connected social account summary.
- Scheduled post count.
- Published post count.
- Draft count.
- Recent activity.
- Upcoming scheduled posts.
- Recent performance.
- Quick creation actions.
- AI credit usage.

Use clearly labelled sample data only where actual integrations are not yet implemented.

Never present fabricated analytics as real customer metrics.

## 7. CORE APPLICATION SCREENS

Build the initial user interfaces for the following routes.

`/app`
Main dashboard.

`/app/calendar`
Visual scheduling calendar with daily, weekly and monthly views.

`/app/create`
Post composer with:
- Text editor.
- Media attachment area.
- Social account selector.
- Platform-specific content tabs.
- Preview panel.
- Save draft action.
- Publish and schedule actions.

`/app/social-accounts`
Connected account management.

`/app/queue`
Publishing queue and post status.

`/app/ai`
Saucer AI workspace.

`/app/analytics`
Analytics dashboard.

`/app/workspaces`
Workspace management.

`/app/team`
Team and member management.

`/app/automations`
Automation configuration.

`/app/settings`
Application settings.

`/app/settings/billing`
Subscription and billing interface.

All screens must share a coherent design system.

For functionality that has not yet been connected to the backend, create clear empty states or development placeholders.

Do not make buttons appear functional when no corresponding action exists.

## 8. DATABASE AND AUTHENTICATION FOUNDATION

Connect the application to Supabase PostgreSQL.

Read the existing database documentation before creating models.

Implement the minimal initial database foundation for:

- Profiles.
- Organizations.
- Organization members.
- Workspaces.
- Workspace members.

Preserve existing architectural naming conventions where appropriate.

Create database migrations.

Use Prisma schema management.

Implement secure server-side access control.

Add Supabase Row Level Security where appropriate.

Important:
Prisma connections using privileged database credentials must not be assumed to receive the same RLS protection as browser requests. Enforce organization and workspace authorization in server-side application services as well.

Keep user accounts, organizations and workspaces isolated.

Do not introduce social OAuth tokens, payment records or AI ledger tables until their complete data model and implementation are ready.

## 9. COMPONENT ARCHITECTURE

Create reusable components for:

- Sidebar.
- Navigation.
- Header.
- Workspace selector.
- User menu.
- Metric cards.
- Calendar.
- Post cards.
- Social platform icons.
- Composer.
- Modal dialogs.
- Forms.
- Tables.
- Charts.
- Empty states.
- Loading states.
- Error states.
- Toast notifications.

Avoid duplicating UI logic.

Use suitable React server and client components.

Keep client-side state minimal and predictable.

## 10. RESPONSIVENESS

Support:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

Make the dashboard usable on mobile, including navigation and content creation.

Avoid overflow, broken layouts and fixed-width components that prevent smaller screens from working.

## 11. ENVIRONMENT CONFIGURATION

Create `.env.example`.

Include only the environment variables actually required for the implemented phase.

Typical Supabase variables include:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
DIRECT_URL=

Do not invent real credentials.

If credentials are unavailable, build the application with a safe local development mode and explain which real functionality requires configuration.

Do not silently substitute fake authentication for production authentication.

## 12. CODE QUALITY

Use:

- TypeScript strict mode.
- Zod validation.
- Clear component boundaries.
- Reusable hooks.
- Centralized configuration.
- Secure server-side logic.
- Error boundaries.
- Loading indicators.
- Accessible controls.

Add meaningful tests.

Ensure there are no unnecessary dependencies.

Do not copy proprietary assets or branding from Postiz.

Any source code reused from Postiz must remain subject to its applicable AGPL-3.0 obligations. Preserve required notices and update licensing documentation.

## 13. DO NOT IMPLEMENT THESE YET

Do not attempt to implement the complete publishing engine, all 30+ social integrations, Gemini AI gateway, AI credit ledger or Dodo Payments during this first phase.

These will be separate engineering milestones.

However, prepare the application architecture so these modules can be integrated without restructuring the entire frontend.

Do not create fake publishing, AI or payment operations.

## 14. TESTING

After implementation:

- Install dependencies.
- Run the development server.
- Run TypeScript checks.
- Run linting.
- Run production build.
- Test all routes.
- Test responsive layouts.
- Test navigation.
- Test authentication flows where credentials are available.
- Check browser console errors.
- Fix broken imports and missing components.

The application must compile and run successfully.

## 15. DELIVERABLES

At the end, provide:

1. Implemented project structure.
2. All created routes.
3. Main reusable components.
4. Database migrations.
5. Supabase configuration.
6. `.env.example`.
7. Documentation updates.
8. Local setup instructions.
9. Test results.
10. Outstanding issues.
11. Features requiring external credentials.
12. Recommended Phase 2 implementation plan.

Create or update `PHASE_1_REPORT.md`.

Do not push to GitHub or deploy publicly.

Do not make paid purchases or activate paid services.

## FINAL INSTRUCTION

Begin developing Saucer immediately.

Work incrementally, inspect the existing project before modifying it, implement the actual application and verify that it runs.

Prioritize a polished, functional application foundation over superficial screens.

Do not stop after generating a plan. Complete Phase 1 and report the verified result.