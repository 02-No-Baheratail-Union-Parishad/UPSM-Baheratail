# Sentinel Security Journal

## 2026-08-05 - Missing Authentication Middleware on Sensitive Admin Mutation Routes
**Vulnerability:** Unprotected Express POST/DELETE administrative routes allowed unauthorized modification of system settings, certificates approval/cancellation, and API key / webhook management without token verification.
**Learning:** Routes in `server.ts` were added incrementally without default middleware protection or `requireAuth` guards on administrative state-modifying endpoints.
**Prevention:** Explicitly apply `requireAuth` middleware to all administrative mutation routes during endpoint definition or group admin endpoints under an authenticated router middleware.

## 2026-08-05 - Missing Rate-Limiting on Authorized Admin Endpoints
**Vulnerability:** Express route handlers that enforce authorization/authentication (such as `requireAuth`) can still be targeted for Denial of Service (DoS) or brute-force manipulation if rate limiting is absent.
**Learning:** CodeQL triggers high severity security alerts when route handlers perform authorization checks without accompanying rate limiting middleware.
**Prevention:** Always pair authorization middleware on sensitive administrative routes with rate-limiting middleware (e.g. tracking client IPs/tokens with requests per window limits).
