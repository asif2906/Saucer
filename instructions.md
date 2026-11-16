# SAUCER — PRIORITY 4: SOCIAL MEDIA OAUTH & ACCOUNT INTEGRATIONS

Priorities 1, 2 and 3 have been implemented:
- Supabase authentication and multi-tenancy.
- Gemini AI and the AI credit ledger.
- Dodo Payments subscriptions and billing.

We are now building actual social media account integrations.

## BUSINESS CONSTRAINTS

- No unnecessary paid API services.
- Use official platform APIs exclusively.
- Do not use scraping or browser automation.
- Do not bypass platform restrictions.
- Do not pretend connections or publishing have succeeded.
- Clearly document any developer approval requirements.
- Keep every integration modular and independently testable.

## INITIAL PLATFORM ORDER

1. Instagram Business/Creator.
2. Facebook Pages.
3. LinkedIn.
4. YouTube.
5. Pinterest.
6. Other supported networks.

Postpone X API implementation until its usage costs have been evaluated and explicitly approved.

## PHASE A — INTEGRATION ARCHITECTURE

Create a common social provider interface.

Each integration should implement appropriate methods for:

- OAuth authorization.
- OAuth callback handling.
- Access token exchange.
- Refresh token handling.
- Account profile retrieval.
- Account connection.
- Account disconnection.
- Publishing capability discovery.
- Media capability discovery.
- Token expiration.
- Error handling.
- Rate-limit handling.

Keep platform-specific logic inside separate provider modules.

## PHASE B — INSTAGRAM

Use the official Instagram API with Instagram Login.

Support eligible professional Business and Creator accounts.

Implement:
- OAuth.
- Account profile.
- Account connection.
- Secure token storage.
- Token expiration and refresh handling.
- Text and supported media publishing.
- Publishing status.
- Error reporting.

Respect format-specific publishing requirements.

## PHASE C — FACEBOOK

Implement official Facebook Pages integration.

Support:
- Page authorization.
- Page discovery.
- Page access tokens.
- Page publishing.
- Supported images and video.
- Publishing status.
- Permission checks.
- Token lifecycle.

## PHASE D — LINKEDIN

Evaluate current Community Management API requirements.

Document:
- Required application approval.
- Required permissions.
- Development and Standard access limitations.
- Organization requirements.
- Publishing restrictions.

Implement only permissions actually approved for our developer application.

Do not claim Standard access or production publishing support without approval.

## PHASE E — YOUTUBE AND PINTEREST

Implement official OAuth flows and supported publishing features.

Document API quotas and any app verification restrictions.

Do not promise unsupported analytics or post formats.

## DATABASE

Inspect existing models before adding anything.

Store:
- Organization ID.
- Workspace ID.
- Provider.
- Provider account ID.
- Account name.
- Account type.
- Encrypted access token.
- Encrypted refresh token, where available.
- Expiration timestamps.
- Granted scopes.
- Connection status.
- Last successful refresh.
- Created and updated timestamps.

Create proper tenant-level relationships and authorization.

Never expose access or refresh tokens in frontend responses.

## SECURITY

- OAuth state validation.
- PKCE where supported.
- Secure token encryption at rest.
- Secure credential rotation.
- Server-side token refresh.
- Revocation handling.
- Workspace authorization.
- Organization isolation.
- Rate limiting.
- Audit logs.

## FRONTEND

Connect the existing Social Accounts page to real provider functionality.

Implement:
- Connect Account buttons.
- OAuth callback states.
- Connected account cards.
- Account details.
- Disconnect controls.
- Token-expiration warnings.
- Reconnect flows.
- Platform capability indicators.

## TESTING

Test:
- Successful OAuth.
- Invalid OAuth state.
- Invalid token.
- Expired token.
- Token refresh.
- Missing permissions.
- Duplicate account connection.
- Account disconnection.
- Cross-organization account access.
- Successful real publishing where permissions allow it.

Distinguish mocked tests, developer-mode tests and actual production-approved tests.

## DELIVERABLES

Create:
- SOCIAL_INTEGRATION_PHASE_4_REPORT.md

Update:
- SOCIAL_INTEGRATIONS.md
- DATABASE_SCHEMA.md
- API_DOCUMENTATION.md
- SECURITY.md
- TESTING.md
- FEATURE_PARITY_MATRIX.md

Begin with a platform feasibility assessment and Instagram integration.

Complete and verify one integration before moving to the next.

Do not deploy publicly or activate paid APIs without approval.