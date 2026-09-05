# Palette's UX Journal

## 2026-09-05 - Admin Authentication Modal ARIA & Form Association
**Learning:** Admin authentication modals with icon-only close buttons and PIN inputs often lack proper accessibility landmarks, accessible names, and form field bindings. Adding `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, explicit `aria-label` for icon close buttons, and `htmlFor`/`id` bindings significantly improves screen reader usability without visual disruption.
**Action:** Always check modal dialog wrappers for ARIA landmark roles and ensure form labels are explicitly bound to their input elements across all modal dialog components.
