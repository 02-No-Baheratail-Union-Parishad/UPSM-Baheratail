## 2026-08-05 - SSRF Protection on Webhook and Integration Dispatchers
**Vulnerability:** Unvalidated target URLs in `dispatchWebhooks`, `POST /api/admin/webhooks`, and `POST /api/admin/apps-script-sync` permitted requests to internal network addresses (e.g. `http://localhost`, `169.254.169.254`, `10.x.x.x`), creating Server-Side Request Forgery (SSRF) risks.
**Learning:** Checking only string prefix `url.startsWith("http")` allows internal IPs and metadata endpoints to be targeted when the application dispatches webhook payloads or sync requests.
**Prevention:** Always validate all outbound URLs with `isSafeUrl()` before storing or fetching, restricting protocols to `http:`/`https:` and rejecting loopback, private IPv4/IPv6, and Cloud metadata addresses.
