## 2026-08-05 - Insecure Firestore Security Rules Bypasses
**Vulnerability:** `firestore.rules` contained `allow delete: if isAdmin() || true;` on certificates and `allow read, write: if true;` on sensitive administrative collections (`/configs/secrets`, `/apiKeys`, `/webhooks`, `/backups`, `/citizens`).
**Learning:** Hardcoded `|| true` clauses and wildcard public permissions left critical infrastructure collections accessible to unauthenticated users despite helper functions `isAdmin()` and `isStaff()` being defined.
**Prevention:** Always verify Firestore security rules using strict role-based helper functions (`isAdmin()`, `isStaff()`) and avoid logical OR (`|| true`) overrides during development.
