# Palette's UX Journal

## 2025-05-18 - Interactive Notice List Items Accessibility
**Learning:** Interactive list items rendered as `<div>` with `onClick` handlers prevent keyboard users (Tab/Enter/Space) and screen reader users from accessing notice details easily.
**Action:** Always render interactive clickable items as `<button>` with `type="button"`, `aria-pressed` / `aria-label`, and `focus-visible` styling.
