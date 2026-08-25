## 2026-03-30 - Module-scoped pre-allocation for numeral conversion

**Learning:** `toBengaliNumeral` and `toEnglishNumeral` are called extremely frequently across UI tables, analytics charts, and date formatters. Allocating `Record<string, string>` and `RegExp` objects per call created noticeable garbage collection (GC) pressure during list/chart renders. Moving lookups to module-level constants and using direct ASCII offset array indexing (`w.charCodeAt(0) - 48`) eliminated per-call allocations and hash lookups.
**Action:** Always pre-allocate static transformation maps and regex patterns at the module scope for hot-path utility functions.
