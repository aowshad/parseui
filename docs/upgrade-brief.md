# ParseUI upgrade brief — patterns to adopt from spaceui.one

## Status

| Phase | State | PR |
| --- | --- | --- |
| 1. Real install path | Done | [#12](https://github.com/aowshad/parseui/pull/12) |
| 2. Docs shell upgrades | Not started | — |
| 3. Component craft | Not started | — |

### Notes from Phase 1

- Component source lives in `registry/parseui/ui/`. Conventions and the site-CSS → Tailwind token map are in [registry/README.md](../registry/README.md). `npm run check` typechecks and rebuilds `r/`.
- The docs site is vanilla JS, not React. For springs on the site, use the vanilla `motion` API (`animate` with `type: "spring"`) from a pinned CDN version, with the same spring values as below. `motion/react` applies to the registry components.
- `@tanstack/react-table` and `react-day-picker` are pinned to majors 8 and 9 in `registry.json`; their latest majors have breaking APIs.
- Registry item JSON (`r/<name>.json`) already lists each component's npm dependencies, so Phase 2's "Powered by" list can read it at runtime.

---

Context: ParseUI (aowshad/parseui, GitHub Pages, hash routes like #/docs/switch) is ParseLab's design
system for Shopify admin apps. Reference: https://www.spaceui.one (Fumadocs + Base UI + Tailwind +
motion + @tabler/icons-react). Adopt the docs-site interactivity and the component craft below.
Do NOT adopt shaders/WebGPU/orbs/gooey/3D carousels — out of scope for admin UI.
Follow the CLAUDE.md branch + PR workflow. One PR per phase.

## Global rules for every animated component
- Use `motion` (motion/react) springs, not CSS ease curves, for layout/size changes.
  Default spring: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 }.
- Respect `prefers-reduced-motion`: springs collapse to instant or opacity-only.
- Animations must never shift layout of surrounding content or delay input.
- Keep every component keyboard + screen-reader correct; motion is decoration only.

## Phase 1 — Real install path (highest priority)
1. Convert components to a shadcn-compatible registry: add `registry.json`, run `shadcn build`,
   publish `public/r/*.json` to GitHub Pages.
2. Docs install snippets become:
   `pnpm dlx shadcn@latest add https://aowshad.github.io/parseui/r/switch.json`
   (later a namespace `@parseui/switch` via components.json `registries`).
3. Until a `parseui` npm package actually exists, remove or replace every `npx parseui@latest ...`
   string on the site (hero, "How our developers use it" section, install tabs).
4. Install block keeps the CLI | Manual tabs plus pnpm/npm/yarn/bun tabs. The selected package manager
   is a global preference (localStorage, try/catch) shared by every snippet on every page.

## Phase 2 — Docs shell upgrades
1. **Floating bottom dock** (fixed, centered, bottom 16px + safe-area, pill, backdrop-blur,
   1px border, ~40px tall icon buttons with tooltips). Buttons, left→right:
   - Theme: cycles system → dark → light; icon reflects current mode. Use the View Transition API
     with a circular reveal from the button position (fallback: instant).
   - Interface sounds: mute/unmute, muted by default. Short (<80ms) soft clicks on switch/tab/copy.
   - Brand color: popover titled "THEME COLOR" with a Reset button and a 4-column swatch grid
     (Parse blue default, plus zinc, green, purple, indigo, yellow, red, sky, pink, orange, violet).
     Each swatch has a label and a check on the active one. Picking a swatch regenerates the brand
     ramp tokens live across the whole site, including the hero dashboard preview. Move the existing
     header palette icon ("Try a brand") into this dock.
   - Layout mode: standard | wide (toggles docs max-width).
   - Package manager selector (same global preference as Phase 1).
   - Favorites: heart count, popover listing favorited components.
2. **Header:** inset floating pill nav (margin 12px, rounded-2xl, blur) that docks over content on
   scroll. Docs and Components become dropdown menus with grouped links and one-line descriptions.
3. **Component page meta row** (under the description, beside Stable/Figma/Source):
   - gzip size of the component source (computed at build time).
   - "Updated on <date>" taken from git log of the file.
   - A "Copy page" button that copies the page as Markdown (description, install, usage, props),
     for pasting into LLMs.
4. **Preview frame toolbar**, right side: favorite (heart), per-preview theme toggle, copy code,
   and "open in new tab". The new tab is an isolated route `#/preview/<slug>` with no docs chrome.
   Keep the existing dotted-grid canvas.
5. **Right rail:** under "On this page", add a "Powered by" list of the component's npm deps.
   Keep the "Help shape ParseUI" card.
6. **Sidebar:** category headers with counts (already done for Components) for every group. Add
   status pills per item: Free / New / Soon.
7. **Components overview page:** a grid of cards (title + category chip top row; inset description
   panel; "View →" bottom right). The homepage section becomes a bento grid of LIVE mini-previews
   (real components rendered, interactive) with the name + ↗ in a footer strip, followed by a
   stats row (e.g. "29 Components · 12 Blocks · 1 Example · 40+ Tokens") using animated numbers.

## Phase 3 — Component craft (apply to existing + "Soon" components)
1. **Concentric nested surfaces ("double bezel")**: outer shell = muted bg, p-1, radius R; inner
   panel = card bg, radius R−4px. Use this for cards, accordion items, timeline cards, popovers.
   Add a `--radius-inner: calc(var(--radius) - 4px)` token.
2. **Sliding indicator** for Tabs, segmented control (Monthly/Yearly), and sidebar active item:
   a shared `motion` layoutId pill that springs between options. The same pattern applies to row
   hover highlight in menus and lists.
3. **Switch:** the thumb stretches horizontally while toggling (scaleX ≈1.25 mid-travel) then
   springs back. Subtle — no liquid blob.
4. **Accordion — "Bouncy" variant:** when an item opens, it detaches from its neighbours with an
   animated gap (0 → 8px) and its corners round fully. Closed items stay joined as one rounded group.
   Each item has a leading icon tile (32px, muted bg, rounded-lg). Props:
   items, defaultValue, value, onValueChange, className.
5. **Animated numbers:** an `AnimatedNumber` primitive (use `@number-flow/react`) with locale +
   currency formatting. Use it in KPI cards (Total revenue, Orders, Conversion, AOV), the badge count
   in the sidebar, and pagination.
6. **Status badge:** a dot variant with a pulsing ring for live states (Live, Syncing, Online).
   Respect reduced motion.
7. **Avatar:** add ring, status indicator (online/away/busy), and a deterministic generated fallback
   (seed = name → same gradient/initials color every time). AvatarGroup expands on hover to reveal
   all members, with a "+N" overflow chip.
8. **Timeline** (new): vertical steps with states done ✓ / running (spinner) / pending ○, a duration
   chip (12s, 1m 45s) beside the title, and an inset detail card per step. Primary use: order
   fulfilment and app sync history.
9. **File upload** (planned "Soon" item): dashed drop zone. On drag-over, show an animated border
   beam plus a radial glow following the cursor. File rows show an extension badge
   (PNG/SVG/PDF) and states: queued, uploading with %, done, error + retry.
10. **Command menu** (planned): starts as a compact search pill in the header that morphs (width +
    radius spring) into the full ⌘K panel. Grouped results, keyboard nav, recent items.
11. **Date picker** (planned): calendar plus a preset rail (Today, Last 7 days, Last 30 days, This
    quarter, Custom). Range selection with a sliding highlight. Same component powers the dashboard
    "Last 30 days" select.
12. **Data table** (planned): filter bar with removable chips + "Clear all", column sort, column
    resize, row selection with a floating bulk-action bar that springs up from the bottom.
13. **Drawer** (planned): spring in from the right, frosted overlay. Add a reusable `FrostEdge`
    utility (stacked masked backdrop-blur layers) for sticky headers and scroll-container edges.
14. **Slide to confirm** (new, small): for destructive actions (delete store data, uninstall).
    Includes a keyboard fallback button.

## Out of scope (note in docs as "Expressive tier — later")
Shaders, mesh/silk gradients, orbs, gooey filters, 3D carousels, textmoji, scatter text.

## Definition of done per component
Preview + Code tabs, CLI/Manual install, usage snippet, props table, a11y notes, reduced-motion
behavior documented, light + dark verified, registry JSON generated, Figma link.
