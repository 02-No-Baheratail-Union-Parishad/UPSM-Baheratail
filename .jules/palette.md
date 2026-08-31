## 2026-03-30 - Modal Icon-Only Button Accessibility Pattern
**Learning:** In React modal overlays across civic administration portals, close (`X`) buttons and file removal buttons frequently rely solely on Lucide icon SVG components without inner text, making them invisible to screen reader users and lacking tooltips for mouse hover/keyboard focus.
**Action:** Always include explicit localized `aria-label` and `title` attributes on icon-only interactive elements (`<button>` with SVG icon inside) across all overlay and dialog components.
