## 2026-08-05 - SSRF Vulnerability in Webhook & External Integration Endpoints
**Vulnerability:** Webhook dispatching and external sync endpoints accepted user-supplied target URLs without validating if they point to private/internal IP addresses or loopback targets (e.g. 127.0.0.1, 169.254.169.254).
**Learning:** Checking URL scheme (`http://`) is insufficient to prevent SSRF. Webhooks and external proxy endpoints must validate resolved hostnames/IPs against private RFC 1918/4193 ranges and localhost before initiating HTTP requests.
**Prevention:** Use a centralized `isSafeExternalUrl` validator for all outbound HTTP requests in backend route handlers.
