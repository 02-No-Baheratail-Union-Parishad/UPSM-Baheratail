## 2026-03-30 - Overly Permissive Firestore Rules and Debug Bypasses
**Vulnerability:** Debug bypasses like `|| true` in deletion rules allowed unauthenticated users to delete certificate records, and permissive `allow read, write: if true;` rules exposed sensitive administrative collections (`configs/secrets`, `apiKeys`, `webhooks`, `backups`).
**Learning:** Development/debug flags left in security rules bypass authentication helpers and expose sensitive system collections to public manipulation.
**Prevention:** Always ensure Firestore rule conditions enforce proper role checks (`isAdmin()`, `isStaff()`) for deletion and administrative collections, and never leave `|| true` or unconditional write permissions on backend rules.
