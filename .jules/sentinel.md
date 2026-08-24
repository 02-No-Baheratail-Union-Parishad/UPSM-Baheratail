# Sentinel Security Journal

## 2026-08-05 - Missing Authentication Middleware on Sensitive Admin Mutation Routes
**Vulnerability:** Unprotected Express POST/DELETE administrative routes allowed unauthorized modification of system settings, certificates approval/cancellation, and API key / webhook management without token verification.
**Learning:** Routes in `server.ts` were added incrementally without default middleware protection or `requireAuth` guards on administrative state-modifying endpoints.
**Prevention:** Explicitly apply `requireAuth` middleware to all administrative mutation routes during endpoint definition or group admin endpoints under an authenticated router middleware.
