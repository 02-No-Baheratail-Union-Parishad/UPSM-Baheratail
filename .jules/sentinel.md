## 2026-08-05 - SSRF Protection on Dynamic HTTP Outbound Endpoints
**Vulnerability:** User-controlled target URLs passed to server-side `fetch` in `/api/admin/apps-script-sync` permitted requests to `localhost` and private IP spaces (SSRF).
**Learning:** Outbound integration endpoints like webhooks or sync integrations must strictly validate URL schemes and reject loopback/private IPv4/IPv6 address ranges.
**Prevention:** Use standard URL parsing and hostname checking against localhost, private IPv4 CIDRs (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`), and private IPv6 blocks before making outbound fetch calls.
