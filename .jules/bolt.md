# Bolt's Journal - Critical Learnings

## 2025-05-18 - Avoid Repeated Array Traversals & Per-Element Normalization in React List Renderers
**Learning:** In register components such as `CitizenMasterRegister`, performing inline `.filter()` calls for multiple statistics (e.g., gender, beneficiary counts) creates O(3N) array traversals and allocations on every render pass. Furthermore, string normalization (`searchQuery.trim().toLowerCase()`) inside filter predicate loops executes N times per character typed.

**Action:** Combine multi-stat calculations into a single O(N) `useMemo` pass, and hoist query normalization outside filter loops.
