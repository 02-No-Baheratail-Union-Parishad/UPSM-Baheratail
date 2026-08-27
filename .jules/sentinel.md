## 2026-08-05 - Missing Authentication on Administrative Endpoints
**Vulnerability:** Critical administrative endpoints for configuration update (`/api/admin/config`), certificate approval (`/api/admin/approve-cert`), certificate cancellation (`/api/admin/cancel-cert`), and batch certificate approval (`/api/admin/batch-approve`) were missing authentication middleware (`requireAuth`).
**Learning:** Endpoints created during rapid development or features intended for administrative dashboards can easily omit express middleware like `requireAuth` if auth checks are only assumed on the client side.
**Prevention:** Ensure all non-public administrative POST/PUT/DELETE endpoints explicitly use `requireAuth` middleware at the Express router level.
