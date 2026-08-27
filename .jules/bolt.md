## 2026-03-30 - Module Scope Static Dictionaries for Numeral Conversion

**Learning:** `toBengaliNumeral` and `toEnglishNumeral` in `src/lib/utils.ts` are called hundreds of times per second during UI interactions (date formatting, table rendering, live search). Instantiating digit mapping dictionary objects (`Record<string, string>`) inside function scope creates constant garbage collection pressure and unnecessary object allocations.

**Action:** Always place static translation/lookup dictionaries (`ENGLISH_TO_BENGALI_DIGITS`, `BENGALI_TO_ENGLISH_DIGITS`) at the module scope level rather than recreating them inside hot utility functions.
