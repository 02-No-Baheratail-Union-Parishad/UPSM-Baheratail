## 2026-08-05 - Centralized SSRF Protection for Outbound Webhooks
**Vulnerability:** Webhook configuration endpoints (`/api/admin/webhooks`) and event dispatcher routines (`dispatchWebhooks`) allowed private/internal IP address ranges (e.g., `127.0.0.1`, `10.x.x.x`, `169.254.169.254`, `localhost`), posing a Server-Side Request Forgery (SSRF) risk.
**Learning:** Checking URL hostnames inline in test endpoints left background dispatchers and creation routes unprotected against SSRF.
**Prevention:** Use a centralized helper (`isSafeWebhookUrl`) to validate all user-supplied outbound URLs before saving or executing requests.
