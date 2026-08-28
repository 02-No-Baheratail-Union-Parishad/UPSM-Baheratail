## 2026-03-30 - Client-Side Filtering & Memoization in CitizenLogs
**Learning:** Refetching logs from backend API and Firebase on every keystroke/filter state change in `CitizenLogs` caused unnecessary network overhead and UI lag.
**Action:** Separate initial log fetching from filtering using `useMemo` for client-side filtering and wrap components in `React.memo` to eliminate redundant network requests and re-renders.
