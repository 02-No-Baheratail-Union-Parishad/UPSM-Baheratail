# Palette's UX Journal

## 2025-05-18 - Modal Dialog Accessibility & Focus States
**Learning:** Icon-only close buttons and tab buttons in authentication modals need explicit ARIA roles, labels, and focus indicators to ensure full keyboard navigation and screen-reader usability.
**Action:** Always include `role="dialog"`, `aria-modal="true"`, `aria-label`, and visible focus rings (`focus-visible:ring-2`) on modal dialogs and tab controls.
