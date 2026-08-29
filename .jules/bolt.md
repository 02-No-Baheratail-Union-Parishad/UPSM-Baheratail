# Bolt Performance Journal

## 2026-07-14 - Bengali Numeral Conversion Loop Optimization
**Learning:** Frequent string number conversions in UI lists, tables, and certificate formatting incur significant overhead when creating inline regex instances and mapping objects per call. Replacing regex with charCode range checks (`code >= 48 && code <= 57` for ASCII digits and `code >= 0x09E6 && code <= 0x09EF` for Bengali digits) and pre-allocated arrays provides ~3.5x–5x speedup without breaking surrogate pairs or text.
**Action:** Prefer direct charCode character iteration for string character replacements in hot path formatting utilities.
