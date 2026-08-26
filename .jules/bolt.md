# Bolt's Journal - Performance Learnings

## 2025-05-18 - Hoisting Utility Lookup Dictionaries and RegExps
**Learning:** In utility functions called repeatedly throughout the application (such as numeral conversions `toBengaliNumeral` and `toEnglishNumeral`), instantiating object literals and compiling regular expressions inside function bodies causes repeated heap allocations and garbage collection overhead. Hoisting map objects and global `RegExp` instances to module scope retains clean, idiomatic `.replace()` calls while avoiding runtime object creation.
**Action:** Always check frequently called text formatting and numeral conversion helpers for inline object or regex declarations and hoist them to module scope.
