## 2025-05-18 - Clickable Container Accessibility Pattern
**Learning:** In Tailwind-based React components, using `div` with `onClick` for selection items (such as notice board items or list cards) prevents keyboard navigation and screen reader state communication (`aria-pressed`).
**Action:** Always wrap interactive list items in semantic `<button type="button">` with `w-full text-left`, `aria-pressed`, descriptive `aria-label`, and `focus-visible:ring-2` focus indicators.
