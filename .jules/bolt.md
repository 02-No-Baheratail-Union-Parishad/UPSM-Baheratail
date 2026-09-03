# Bolt's Journal - Critical Learnings

## 2026-03-31 - Single-pass Memoization for Array Aggregations
**Learning:** In React components with tabular registers (such as `CitizenMasterRegister.tsx`), calling multiple `.filter()` methods in JSX for summary cards re-executes array passes on every component render (including state updates like modal visibility or toast toggles). Consolidating statistics into a single `useMemo` loop eliminates duplicate iterations and string comparisons.
**Action:** Always replace multiple inline `.filter().length` expressions with a single `useMemo` loop (`stats`) when calculating multi-category summary counts over state arrays.
