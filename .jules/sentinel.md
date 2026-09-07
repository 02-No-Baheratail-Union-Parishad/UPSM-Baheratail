## 2026-08-05 - SSRF Protection for External Webhooks & Apps Script Integrations
**Vulnerability:** External URLs configured for Apps Script WebApp sync and webhooks were fetched without validation, creating a Server-Side Request Forgery (SSRF) risk to internal/private network resources.
**Learning:** External webhook endpoints and integration service URLs must be validated before being invoked or persisted in configuration.
**Prevention:** Use `validateExternalUrl` to enforce http/https protocols and reject localhost, loopback, private IPv4 (10.x, 127.x, 169.254.x, 192.168.x, 172.16-31.x), and private IPv6 addresses before performing HTTP requests.
