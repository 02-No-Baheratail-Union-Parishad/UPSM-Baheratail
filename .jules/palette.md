# Palette's Journal - UX & Accessibility Learnings

## 2026-03-31 - Notice Board Accessible Card Navigation
**Learning:** Interactive cards built as `<div>` tags prevent keyboard focus navigation and miss screen reader aria selection states.
**Action:** Replace interactive card containers with `<button type="button">` using `aria-pressed={isSelected}` and explicit `focus-visible:ring-2` focus rings.
