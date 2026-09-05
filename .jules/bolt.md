## 2026-07-08 - Module-level pre-allocation for digit formatting lookup tables
**Learning:** Re-creating digit map literals (`Record<string, string>`) inside heavily called utility functions like `toBengaliNumeral` and `toEnglishNumeral` causes excessive object allocations and GC pressure during UI rendering (e.g., date conversion, dashboards, tables, and lists).
**Action:** Always extract static mapping dictionaries outside function scope to module level, and avoid duplicating numeral formatting logic across utility files.
