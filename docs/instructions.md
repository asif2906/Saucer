# CRITICAL BUG: SAUCER AUTHENTICATION RETURNS THE WRONG USER

STOP ALL OTHER DEVELOPMENT.

We have a serious production authentication bug.

I personally registered an account using my own email and password. After logging in with those credentials, Saucer displayed a test/demo account instead of my actual account.

This is unacceptable and may represent a customer data-isolation vulnerability.

Your ONLY priority is to identify and fix this problem.

Do not redesign the UI.
Do not implement new features.
Do not add mock data.
Do not create another test login.
Do not claim this is fixed because the build passes.

## TASK 1 — TRACE THE ACTUAL AUTHENTICATED IDENTITY

Follow the complete flow:

Login form
→ Supabase signInWithPassword
→ Authenticated Supabase user
→ Browser session
→ Middleware cookie synchronization
→ Server-side authenticated user
→ Profile lookup
→ Organization lookup
→ Workspace lookup
→ Dashboard rendering.

At every stage, identify the actual user ID and confirm it remains consistent.

Do not assume that the displayed profile is the authenticated user.

Use Supabase's server-verified getUser() or verified getClaims() appropriately. Do not use the user object returned by getSession() alone to make authorization decisions.

Official reference:
https://supabase.com/docs/guides/auth/server-side

## TASK 2 — FIND AND REMOVE DEMO ACCOUNT FALLBACKS

Search the entire source code for:

- demo
- test account
- mock user
- mock profile
- sample user
- fallback user
- default profile
- hardcoded email
- seeded dashboard data
- static test organization
- hardcoded workspace

Check all authentication contexts, hooks, layouts, dashboard components, API routes, server actions and data access utilities.

Inspect the existing test accounts created by earlier automated scripts.

Determine whether their identity or data is accidentally being used by production code.

In production, missing authentication or missing profile data must cause an explicit error, never a demo-user substitution.

Remove demo fallbacks from the production execution path.

## TASK 3 — VERIFY PROFILE MAPPING

Inspect the actual Prisma schema and Supabase database.

The previous report showed different values for Profile.id and Supabase Auth user ID.

Understand the actual relationship.

Determine the correct unique mapping between:
- auth.users.id
- Profile.id
- Profile.supabaseUserId
- OrganizationMember.profileId
- WorkspaceMember.profileId

Every authenticated user must resolve to their own profile.

Never retrieve an arbitrary profile using findFirst() without a user-specific filter.

Never choose the first organization or workspace in the database as a substitute for the authenticated user's membership.

If there is no matching profile, display an explicit provisioning error and investigate the user-creation trigger.

## TASK 4 — FIX SESSION HANDLING

Inspect:

- src/middleware.ts
- src/lib/supabase/client.ts
- src/lib/supabase/server.ts
- src/lib/supabase/middleware.ts
- login page
- signup page
- authentication callbacks
- application layout

Ensure browser and server Supabase clients correctly use cookie-based sessions.

For our Next.js 15.2.1 application, ensure middleware.ts is correctly configured.

Verify refreshed cookies are written to the response and forwarded correctly.

Check for conflicting authentication clients and stale sessions.

Use one consistent Supabase project across authentication, frontend and backend.

## TASK 5 — INVESTIGATE STATIC RENDERING AND CACHING

Our earlier Phase 1 report claimed that all application routes were prerendered as static pages.

Investigate this carefully.

User-specific authenticated application pages must not accidentally serve cached user data across different sessions.

Review:

- Next.js route rendering configuration.
- fetch caching.
- CDN caching.
- ISR.
- React cache usage.
- Server-side data fetching.
- Static demo data.

For Next.js 15, use appropriate dynamic rendering and no-store behavior for authenticated data.

Do not disable caching globally when only user-specific routes require dynamic behavior.

Reference:
https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config

## TASK 6 — ADD TEMPORARY AUTH DIAGNOSTICS

Create a safe, server-side-only diagnostic mechanism for the Vercel Preview environment.

For each authenticated request, verify:

- Actual Supabase authenticated user ID.
- Actual authenticated email.
- Profile ID.
- Profile-to-auth-user mapping.
- Organization ID.
- Workspace ID.
- Supabase project host.
- Session validity.

Do not log:
- Access tokens.
- Refresh tokens.
- Passwords.
- API secrets.

The diagnostic must never be exposed publicly or use privileged credentials to bypass normal tenant authorization.

## TASK 7 — REAL TESTING

Use two genuinely separate test users.

Test:

USER A:
- Register.
- Verify email.
- Login.
- Confirm actual authenticated user ID.
- Confirm own profile.
- Confirm own organization.
- Confirm own workspace.
- Refresh page.
- Navigate across dashboard pages.
- Logout.

USER B:
- Register independently.
- Login.
- Confirm completely different identity.
- Confirm separate organization.
- Confirm separate workspace.
- Refresh page.

Then:
- Log User A in again.
- Confirm User B's session has no effect on User A.
- Test two browser sessions simultaneously.
- Test session expiration and refresh.
- Test invalid login.
- Test missing profile.
- Test deleted or revoked session.

The dashboard must display the actual authenticated user's information, not a default test account.

## TASK 8 — VERIFY ON VERCEL PREVIEW

Do not trust local tests alone.

Deploy a dedicated Preview build.

Verify the exact deployed commit and production-equivalent Supabase environment settings.

Test registration and login in a real browser using separate sessions.

Check browser cookies, network requests and server logs.

Do not deploy to production until the Preview test succeeds.

## TASK 9 — ACCEPTANCE CRITERIA

This bug is fixed only when:

1. My actual email is authenticated.
2. The actual Supabase user ID is correctly resolved.
3. The corresponding profile is displayed.
4. The correct organization is loaded.
5. The correct workspace is loaded.
6. No demo user is substituted.
7. Two users see completely separate data.
8. Session refresh works.
9. Dashboard information remains correct after navigation and reload.

## TASK 10 — FINAL REPORT

Create AUTHENTICATION_ROOT_CAUSE_REPORT.md.

Include:
- Exact root cause.
- Exact files responsible.
- Code changes made.
- Authentication flow before and after.
- Database mapping.
- Session and caching corrections.
- Two-user test results.
- Vercel Preview test results.
- Any remaining issues.

Do not claim success without actual browser verification.

BEGIN WITH THE ROOT CAUSE INVESTIGATION.

Do not touch any other Saucer feature until this authentication issue is completely resolved.