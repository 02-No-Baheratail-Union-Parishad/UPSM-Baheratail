# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-03-31 - Focus Visible Ring Contrast on Emerald Dark Backgrounds
**Learning:** For dark emerald backgrounds (`bg-emerald-900`/`bg-emerald-950`), default browser focus outlines are hard to see. Using `focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none` provides clear contrast matching the primary theme accent color (amber-400).
**Action:** Always pair `focus-visible:ring-amber-400` with icon/toggle buttons in header and sidebar navigation elements.
