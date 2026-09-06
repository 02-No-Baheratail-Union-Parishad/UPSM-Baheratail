# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-09-06 - Interactive Notice List Items & Modal Form Accessibility
**Learning:** Custom clickable list items used as selection buttons in dashboard components (e.g., `NoticeBoardTicker`) lack standard keyboard navigation (`Enter`/`Space` handlers, `tabIndex={0}`, `role="button"`) and screen reader state attributes (`aria-selected`). Form modal fields also frequently lack explicit `htmlFor`/`id` linking and localized `aria-label` buttons for close actions.
**Action:** When creating or editing list selectors and modal forms, always include semantic button attributes (`role="button"`, `tabIndex={0}`, `aria-selected`, `onKeyDown`), explicit label associations (`htmlFor` / `id`), and accessible labels (`aria-label`) on icon/symbol buttons.
