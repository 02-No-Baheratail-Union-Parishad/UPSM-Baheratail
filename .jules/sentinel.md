## 2026-08-05 - SSRF Protection in Webhook Dispatching
**Vulnerability:** Unsanitized outgoing HTTP POST requests in `dispatchWebhooks` allowing Server-Side Request Forgery (SSRF) to internal services or metadata endpoints.
**Learning:** While test endpoints had inline validation, background asynchronous workers like `dispatchWebhooks` and webhook registration endpoints were missing SSRF checks, enabling persistent SSRF via saved config.
**Prevention:** Always validate target URLs against private/loopback IP ranges (`isSafePublicUrl`) at both configuration save time and execution/dispatch time.
