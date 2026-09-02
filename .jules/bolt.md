## 2026-03-30 - Module-Level Caching for D3 Interpolators and Numeral Maps
**Learning:** In high-frequency render paths (such as heatmap tables and live search filtering in UPSM 2.0), instantiating D3 interpolators (`d3.interpolateRgbBasis`) or object literals for digit translation maps inside functions creates high GC pressure and redundant calculations (e.g. parsing 225 color hex strings 45 times per render).
**Action:** Always lift static lookup dictionaries and D3 color interpolator builders out of React component bodies and helper functions into module-level static constants.
