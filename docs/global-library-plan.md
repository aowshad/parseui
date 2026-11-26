# ParseUI: plan to become a global, public UI library

Status: **draft for owner review**. No code changes until a phase is approved.
Supersedes the ordering in [upgrade-brief.md](upgrade-brief.md). That brief's Phase 2 (docs shell) and Phase 3 (component craft) are folded into the roadmap below where they still fit.

---

## 0. Where things stand (audit, 26 Nov 2026)

| Area | State |
| --- | --- |
| Docs site | `index.html`, 355 KB, vanilla JS, hash routes. 29 components, 14 blocks, 2 examples. Previews are HTML/CSS stand-ins, not the React components. |
| Registry | 29 `registry:ui` items + `tokens` + `theme` in `registry.json`, source in `registry/parseui/ui/*.tsx` (~6,100 lines). React 19 style (ref as a prop, no `forwardRef`), `radix-ui`, cva, Tailwind v4 tokens. `npm run check` typechecks and builds `r/`. |
| Blocks | HTML only, inside `index.html`. No React source, no registry items. |
| Tests | None. No unit, a11y or visual tests. |
| CI | None. No `.github/` folder at all. |
| OSS files | No LICENSE (the site claims MIT), no CONTRIBUTING, CODE_OF_CONDUCT, CHANGELOG, templates. |
| npm | `parseui`, `parse-ui` and `@parseui/ui` are all unclaimed (checked 26 Nov). |
| Hard-coded host | 41 `registryDependencies` in `registry.json` point at `https://aowshad.github.io/parseui/r/…`. Changing domain later breaks every installed item's dependency URLs, so the domain decision (§2.1) should come before any promotion. |

---

## 1. Positioning

### 1.1 Who it's for

Product teams and solo developers building **app UIs**: SaaS dashboards, admin panels, settings, internal tools, and the marketing and auth pages around them. They already use (or are fine with) Tailwind + the shadcn CLI, and want components and blocks that are more finished than shadcn's defaults without adopting a closed package.

### 1.2 How it differs

| Library | What it is | Where ParseUI fits |
| --- | --- | --- |
| **shadcn/ui** | The baseline: minimal, unopinionated primitives, copied into your repo. | ParseUI is shadcn-compatible (same CLI, same tokens, installs into an existing shadcn project without overwriting its brand) but ships **higher-level, app-ready components** shadcn leaves to you: Data table with selection and bulk actions, Date picker with presets and ranges, File upload with progress/error/retry, Combobox with multi-select, Input with leading/trailing slots, status Badge, Avatar group. |
| **Origin UI / coss** | Large catalogue of small variants (many inputs, many buttons). | ParseUI goes for **fewer, deeper** items: each component is documented with props, keyboard table, a11y notes and real install, and blocks are complete flows, not visual variants. |
| **Tailwind UI / Catalyst** | Paid, polished, HTML or React kits; not a registry. | ParseUI is free (see §2.3), installs per item via the CLI, and uses Radix for behavior. |
| **Mantine / Chakra / MUI** | npm packages with their own styling systems. | ParseUI is source you own, Tailwind only, no runtime theme provider. |

One-line pitch (proposal): **"Production-ready React components and blocks for app UIs. shadcn-compatible, accessible, yours to edit."**

The things that make it distinct and are worth protecting: tokens that layer on top of shadcn's instead of replacing them, admin-grade data components, a documented keyboard table on every interactive component, and plain-language state communication (e.g. usage meters that warn in words, not only color).

### 1.3 ParseLab- and Shopify-specific content to rewrite

Line numbers are `index.html` on `main` at `85fcf23`.

**Site chrome and meta**

| Line | Current | Change |
| --- | --- | --- |
| 5 | meta description: "design system and React UI library for ParseLab apps" | Use the new pitch. |
| 6–7, 12 | og:title / og:description / `<title>`: "Design system by ParseLab", "for every ParseLab app" | "ParseUI — React components and blocks" (or similar). |
| 982 | Header version tag `v0.1` | Keep a version tag, but drive it from the release (see §5). |
| 2386 | `document.title='ParseUI — Design system by ParseLab'` (home route) | Same as line 12. |
| 2372 | Footer: "by ParseLab", "Built in Dhaka, used worldwide." | Footer: GitHub, License, Changelog, "Made by ParseLab" as a small credit is fine if you want it (decision, §2.1). |
| 2424 | Right rail card: "Share feedback in the #parseui channel" (an internal Slack channel) | Link to GitHub Discussions / issues. |

**Home page (`homePage()`, 2300–2373)**

| Line | Current | Change |
| --- | --- | --- |
| 2310 | Pill "New · v0.1 preview for ParseLab teams" | "New · v0.2 — public preview" linking to the changelog. |
| 2311 | H1 "Build every ParseLab app from one kit." | New headline from the pitch. |
| 2312 | "ParseUI is our design system…" and "a Figma library that matches the code line for line" | Drop "our"; drop the Figma claim until a Figma kit actually exists (it's "Coming with v0.2" today). |
| 2318–2333 hero stage | "Recent orders", "Add product", "Search products" | Generic SaaS data (e.g. invoices, users). Fine as-is technically, but reads e-commerce-only. |
| 2349 | "From blocks to full admin screens… the dashboard most of our apps need" | Remove "our apps". |
| 2354 | Section "How our developers use it" / "so teams can adjust them" | "How it works" / "Install, own, ship". |
| 2359–2365 | "Proposed plans for the public release", "Internal teams get everything", Community / Pro / Team cards with "Buy Pro", "Private Slack channel", "Draft for review" badge | Remove entirely, or replace per §2.3 decision. This is internal draft pricing on a public page. |
| 2369 | Roadmap: "Dashboards, onboarding and settings screens for our apps", "Phase 4 Public release" | Replace with the public roadmap from §6 (or link to GitHub milestones). |

**Docs pages**

| Line | Page | Current | Change |
| --- | --- | --- | --- |
| 2110 | Introduction | "design system for ParseLab products… every app we ship" | Rewrite for public audience. |
| 2111 | Introduction | "v0.1 preview" callout | Keep as a "pre-1.0, APIs may change" callout. |
| 2112 | Introduction | "Why we're building it": ParseLab ships several Shopify apps, Built for Shopify reviews | Replace with "Why ParseUI" (the positioning above). |
| 2114 | Introduction | Principle "Figma and code match: every component has a Figma twin" | Remove or mark as planned. |
| 2116 | Introduction | "alongside Shopify Polaris inside embedded apps" | Drop Polaris; list frameworks only. |
| 2115 | Introduction | "Examples — full screens, starting with a store dashboard" | Generic. |
| 2173 | Theming | "One theme per product: Each ParseLab app keeps its own brand" | "Bring your own brand". |
| 2185–2190 | Figma kit | Whole page promises a Figma library and Code Connect | Hide from nav until it exists (decision, §2.6). |
| 2233 | Components overview | "each with a Figma twin" | Remove claim. |
| 2240, 2258 | Examples | "Pro template" badge + dead Figma / "Open full screen" links (`javascript:void 0`) | Depends on §2.3; at minimum remove dead links. |
| 2239, 1760 | Examples / nav | "Store dashboard" | "Dashboard" (SaaS). |
| 2257 | App settings | "settings screen for an embedded Shopify app: the store sidebar" | Generic app settings. |
| ~2092 | Every component page | Meta row "Figma" chip with `javascript:void 0` | Remove until real. |
| ~2101 | Single-example components | "More examples are added as the component is designed in Figma." | Remove. |
| sidebarHTML | Sidebar | "Pro" tags on Blocks, Dashboard, App settings; "Free" on Components | Depends on §2.3. |

**Component examples (demo copy)**

| Line | Component | Content |
| --- | --- | --- |
| 1157 | Badge | "Order and fulfillment statuses across ParseLab apps use the dot style." Fulfilled / Unfulfilled / Refunded |
| 1163, 1165 | Input | `you@parselab.com` placeholder (the company's real domain), "order notifications" |
| 1233 | Alert | "Your listing is now live on the Shopify App Store." |
| 1246 | Card | "Store details", "Lumen Prints" |
| 1269–1272 | Accordion | "Apps bill through Shopify… on your monthly Shopify invoice" |
| 1320 | Table | customers on `.store` / `dhakathreads.com` domains (fine-ish, but regional and e-commerce) |
| 1375, 1396 | Dropdown menu | Products table "Lumen Prints", "Printly" |
| 1580, 1595 | Command menu | Printly entries |
| 1672 | File upload | Printly copy |
| 1735, 1744 | Data table | Printly / store products |

**Blocks and examples**: every block from 1879–2055 and both examples (1780–1875) use "Printly", "Lumen Prints", `lumen.myshopify.com`, "merchant", "Continue with Shopify", "Billed through Shopify", "Shopify Flow", Shopify App Store review rules and an `apps.shopify.com` review URL. These get replaced wholesale in the block rebuild (§4), not patched.

**README.md**

| Where | Current | Change |
| --- | --- | --- |
| Tagline | "The design system and React UI library for ParseLab apps." | New pitch. |
| Status note | "v0.1 preview", "`@parseui/icons` is a proposal" | Rewrite; drop icons line unless kept on roadmap. |
| What's in the preview | Block list phrased around app onboarding / Billing / "store dashboard" | Regenerate from new catalogue. |
| Roadmap | "Later: public release (free core, Pro blocks and templates)", "matching Figma library" | Link to this plan / GitHub milestones. |
| Footer | "Made by ParseLab, Dhaka." | Credit line per §2.1. |
| Missing | License badge, contributing link, install-for-your-project section, compatibility (React 19, Tailwind v4, shadcn ≥ 3) | Add. |

**Other files**: `docs/upgrade-brief.md` describes ParseUI as "ParseLab's design system for Shopify admin apps" and has Shopify-flavored items (Slide to confirm "uninstall", Timeline for "order fulfilment"). Mark it superseded rather than rewrite. `registry.json` item descriptions are already neutral.

---

## 2. Decisions for you

Each has my recommendation first.

### 2.1 Name: keep **ParseUI** (recommended)

- **Keep.** Unclaimed on npm (`parseui`, `@parseui/*`), already the repo, registry and logo. Changing later is expensive because of the hard-coded registry URLs. Risk: "Parse" also evokes Parse Platform (the open-source backend); low confusion for a UI library, and it ties back to ParseLab as a credit.
- **Rename** only if you want no visible ParseLab connection at all. Cost: new logo, repo rename (GitHub redirects, but Pages URLs and every installed `registryDependencies` URL don't), new domain.
- **Related decision: domain.** Recommend a custom domain (e.g. `parseui.dev` or `ui.parselab.com`) set up **before** promotion, so registry URLs never move again. Staying on `aowshad.github.io/parseui` ties the library to a personal account forever.
- **Action regardless:** claim `parseui` on npm and the `@parseui` org as placeholders now.

### 2.2 License: **MIT** (recommended)

- MIT matches shadcn/ui, Radix and most of the ecosystem; copied source must be freely editable and re-licensable inside customers' closed products. The site already says MIT, so this just makes it true.
- Apache-2.0 adds a patent grant but is heavier to attribute for copy-paste code; rarely used for this kind of library.
- If a Pro tier ever exists, it needs its own commercial license for those files only; the public repo stays MIT.
- Copyright holder: "ParseLab" or your name. Your call.

### 2.3 Free vs Pro: **fully free now; revisit Pro after 1.0** (recommended)

- **Fully free (recommended).** A new library's main asset is adoption and trust; a paywall before there's an audience mostly costs stars and contributors. Everything in the public repo is MIT, blocks included. Remove the plans section and Pro tags.
- **Free core + Pro blocks/templates** (the current draft). Needs a private repo or gated registry, licence keys, payments, support. Realistic only once there's traffic. Splitting later is easy (new Pro-only blocks); taking things away from free later is not.
- Middle path if you want to keep the door open: say on the site "Everything here is free and MIT. Premium templates may come later." and keep future Pro work to *new* full templates, never existing items.

### 2.4 Docs stack: **move to Next.js + Fumadocs + MDX, static export to Pages** (recommended)

| | Keep vanilla `index.html` | Next.js + Fumadocs + MDX |
| --- | --- | --- |
| Previews | HTML stand-ins; every component written twice and drifts (e.g. site Modal has no focus trap, the real one does) | Renders the real registry components; docs parity becomes automatic |
| URLs / SEO | Hash routes, one page to crawlers | Real URLs per page, metadata, sitemap, OG images |
| Search | Custom ⌘K over in-memory list | Fumadocs search (Orama, static) |
| Contributions | One 355 KB file, long single-line handlers; hard for outsiders | One MDX file per component; normal PRs |
| Build | None | Needs a build; Pages must switch to "GitHub Actions" source |
| Cost | Zero now, grows with every new component | One migration (2–3 PRs), then cheaper per component |

Every new component or block on the vanilla site costs two implementations. With ~20 components and ~40 blocks planned, migrate **before** that work, not after.

Constraints to keep: `r/*.json` must stay served at the same URLs (copy into `public/r`); `basePath: '/parseui'` until a custom domain exists; a small script on the new root redirects old `#/docs/<slug>` links to `/docs/components/<slug>`. Keep the customizer and per-preview theme toggle (port to React). Out of the upgrade brief's Phase 2, keep: copy-page-as-Markdown, preview "open in new tab", "Powered by" deps list, package-manager preference. Drop or defer: sounds, favorites, floating dock.

Alternative if you'd rather not migrate: keep vanilla but generate previews by mounting the real components via a small Vite-built bundle. Gets parity but not SEO or easy contributions; I don't recommend it.

### 2.5 Distribution: **registry URL now + namespace `@parseui` via the shadcn registry index; no npm package** (recommended)

- **Registry URL** (today): works, keep it as the canonical source.
- **Namespace** (`npx shadcn add @parseui/button`): users add one line to `components.json` (`"registries": { "@parseui": "https://<domain>/r/{name}.json" }`); listing in the shadcn registry directory makes it work with no config. Do this once the domain is settled (§2.1) so the template URL never changes.
- **npm package**: conflicts with the copy-and-own model, needs bundling, Tailwind source scanning and semver discipline for every class change. Skip. Possible later exception: a tiny `@parseui/tokens` CSS package if people ask.
- Also publish `registry.json` items with `registry:block` and `registry:example` types so v0 / AI tools that read shadcn registries can use them, and an `llms.txt` from the docs site.

### 2.6 Smaller decisions (defaults I'll use unless you say otherwise)

- **Figma kit page:** hide from nav until a kit exists.
- **React support:** React 19+ only (ref as a prop, as today). Supporting 18 means `forwardRef` everywhere; not worth it in 2026.
- **Tailwind:** v4 only.
- **Demo brand:** one fictional neutral brand across all demos (e.g. "Northwind"/"Acme"-style made-up name, made-up domains on `example.com`), never real company names.
- **`docs/upgrade-brief.md`:** keep, add a "Superseded by global-library-plan.md" note.

---

## 3. Component quality bar

### 3.1 Definition of done (every component)

1. Source in `registry/parseui/ui/`, typechecks, `data-slot` on every part.
2. **Accessibility:** follows the WAI-ARIA APG pattern; keyboard table in docs; visible focus; passes axe in a test; text contrast ≥ 4.5:1 in light and dark.
3. **RTL:** logical properties only (`ms-/me-/ps-/pe-/start-/end-/text-start/border-s`), directional icons flip (`rtl:rotate-180`), side props use `start`/`end` where Radix allows. Verified under `dir="rtl"`.
4. **Composition:** `className` on every part; `asChild` on any part that renders a single element users might want to swap (triggers, links, buttons, items); `ref` as a prop.
5. **State:** every piece of internal state is controllable: `value`/`defaultValue`/`onValueChange` (or `open`/`defaultOpen`/`onOpenChange`, etc.), same naming as Radix.
6. **Motion:** `motion-reduce:` fallback on every animation.
7. **Docs:** live preview of the real component, usage, props table generated or checked against the TS types, keyboard table, a11y notes.
8. **Tests:** render + interaction + axe smoke test (Vitest + Testing Library + `vitest-axe`).

### 3.2 Gaps found in the audit

| Gap | Evidence | Fix |
| --- | --- | --- |
| No RTL support | No component handles `dir`. Physical classes in 20 of 29 files: e.g. `data-table.tsx` (pl-/pr-/right-/ml-, 10 hits), `date-picker.tsx` (8), Drawer `side` = left/right with `slide-in-from-right`, Breadcrumb/Pagination/Data table chevrons don't flip, `text-left` in Accordion/Alert/Card/Checkbox. | One sweep PR to logical classes + `rtl:` flips, plus an RTL toggle in docs previews. |
| Data table state is uncontrolled only | Only `defaultSort`; selection and pagination are internal. | Add `sorting`/`onSortingChange`, `rowSelection`/`onRowSelectionChange`, `pagination`/`onPaginationChange` (TanStack's names), keep defaults. |
| Other custom state | Combobox, Date picker, File upload, Slider, Command menu, Pagination already expose controlled props. Input/Textarea are native. Radix-wrapped parts inherit Radix's controlled props through prop spread. | Verify each in tests; document. |
| `asChild` coverage | Present in 12 files (Button, Badge, Breadcrumb, Card, Combobox, Data table, Date picker, Drawer, Dropdown menu, Progress, Select, Tooltip). | Audit the rest; add where a part is a trigger or link (e.g. Pagination items as links, Tabs triggers via Radix already OK). |
| `forwardRef` | Not used, by convention (React 19 ref-as-prop). | Not a gap if §2.6 "React 19 only" is accepted; state it in docs. |
| Contrast | `--text-3`, white on brand blue, success badges below 4.5:1 for small text (known). | Token PR: adjust values in `theme`/`tokens` and site CSS together. |
| Site/real parity | Site stand-ins differ from the real components; site Modal lacks focus trap. | Solved by the docs migration (§2.4). Until then, fix Modal via `modalOpen()`. |
| No tests | — | Add test harness in Phase 2. |
| `Radio` naming | `radio.tsx` is a Radix RadioGroup but the item is called "Radio". | Rename to `radio-group` (keep `radio` as an alias item that depends on it). |
| Internal parts not exposed | Popover and a Calendar are used inside Combobox / Date picker but not published on their own. | Extract `popover` and `calendar` items; make Date picker depend on them. |

### 3.3 Missing components

Tiered by how often app UIs need them. "Extract" means the code mostly exists inside another component.

**Tier 1 — expected by anyone switching from shadcn (next):**
Popover (extract), Calendar (extract), Label, Separator, Skeleton, Spinner, Alert dialog, Sheet (side panel; reconcile with Drawer — recommend Drawer = bottom sheet on mobile, Sheet = side panel), Toggle, Toggle group (also gives the segmented control), Radio group (rename), Collapsible, Scroll area, Hover card, Field / Form (label + description + error, works with react-hook-form and plain forms), Input group, Button group.

**Tier 2 — app shell and richer data:**
Sidebar (collapsible, mobile sheet, keyboard shortcut), Navigation menu, Context menu, Menubar, OTP input (`input-otp`), Chart (Recharts wrappers with token colors + accessible table fallback), Empty state, Stat / KPI (with animated number), Status dot (pulsing, reduced-motion safe), Timeline, Stepper.

**Tier 3 — nice to have:**
Resizable panels, Carousel, Aspect ratio, Rating, Tag input, Number input, Color picker, Tree view, Slide to confirm.

---

## 4. Blocks

### 4.1 From HTML to registry blocks

Each block becomes a `registry:block` item:

```
registry/parseui/blocks/<block-name>/
  page.tsx                 # the block as a ready-to-drop component, demo data inline
  components/<part>.tsx    # optional sub-parts
```

- `registryDependencies` lists the ParseUI components it uses (namespaced once §2.5 lands).
- No data fetching, no router coupling; links are plain `<a>` with `href` props so they work in Next, React Router and Vite.
- Demo content uses the single fictional brand (§2.6). No Shopify, no "merchant", no real company names or domains.
- Each block is responsive down to 375 px, works in light/dark and RTL, passes axe.
- Docs: a block gallery with category filter, full-width live preview with a viewport toggle (desktop/tablet/mobile), code tab with all files, install command.

### 4.2 Mapping the existing 14

| Existing (Shopify flavored) | Becomes |
| --- | --- |
| Sign in (email + "Continue with Shopify") | Auth › Sign in (email + Google/GitHub/SSO) |
| Welcome screen ("Welcome to Printly") | Onboarding › Welcome |
| Setup guide (merchant checklist) | Onboarding › Setup checklist |
| Page header (products, status tabs) | App shell › Page header |
| Resource list (product table) | Data › Resource list (generic: users/invoices/projects) |
| Settings section | Settings › Settings section |
| Stats row | Dashboard › Stats row |
| Notification settings | Settings › Notifications |
| Empty state | Data › Empty state |
| File upload | Data › File upload panel |
| Pricing plans ("app listing pages") | Marketing › Pricing |
| Plan and usage ("billed through Shopify") | Settings › Billing and usage |
| Review request (App Store review rules) | Feedback › Feedback request (NPS / rating + private feedback; keep the "both options always shown" principle, generalised) |
| Help and support | Feedback › Help and support |

Examples: "Store dashboard" → **SaaS dashboard**; "App settings" → **Settings** (account/workspace), keeping the unsaved-changes bar.

### 4.3 Proposed catalogue (v1 target ~40 blocks)

★ = rebuilt from an existing block.

- **Auth (5):** Sign in ★, Sign up, Forgot password, Verify code (OTP), Magic link sent.
- **Onboarding (4):** Welcome ★, Setup checklist ★, Multi-step wizard, Invite teammates.
- **App shell (4):** Sidebar layout, Top-nav layout, Page header ★, Command palette.
- **Dashboard (5):** Stats row ★, Chart card, Recent activity, Top items list, Dashboard overview (composite).
- **Data (5):** Resource list ★, Detail page, Filters bar, Empty state ★, File upload panel ★.
- **Settings (7):** Settings section ★, Profile, Notifications ★, Team members, Billing and usage ★, API keys, Danger zone.
- **Marketing (7):** Hero, Feature grid, Pricing ★, FAQ, Testimonials, Logo cloud, CTA + footer.
- **E-commerce (5):** Product card, Product grid with filters, Cart drawer, Checkout summary, Order details.
- **Feedback & support (3):** Feedback request ★, Help and support ★, Changelog list.

Examples (full screens): SaaS dashboard, Settings, Auth flow, Marketing landing page, Store admin (keeps an e-commerce admin example, brand-neutral).

---

## 5. Open-source basics

| Item | Plan |
| --- | --- |
| `LICENSE` | MIT (per §2.2), copyright holder per your choice. |
| `CONTRIBUTING.md` | Setup, `npm run check`, component conventions (link `registry/README.md`), definition of done (§3.1), branch/PR rules, how to propose a component (issue first). |
| `CODE_OF_CONDUCT.md` | Contributor Covenant 2.1, with a contact email you choose (not committed until you give one). |
| `SECURITY.md` | How to report a vulnerability privately (GitHub private advisories). |
| Changelog + versioning | `CHANGELOG.md` in Keep a Changelog format. Semver for the library as a whole, git tags + GitHub Releases (`v0.2.0`…). Pre-1.0: minor = may break. Each registry item gets a `meta.version`/`updated` field so docs can show "Updated on". No Changesets (that's for npm packages). |
| Issue templates | `.github/ISSUE_TEMPLATE/`: bug report (component, version, repro link), component/block request, docs issue; `config.yml` pointing questions to Discussions. |
| PR template | What / why / how to test, checklist mirroring §3.1 (a11y, RTL, dark, 375 px, reduced motion, `npm run check`). |
| CI | `.github/workflows/check.yml` on `pull_request` and push to main: Node LTS, `npm ci`, `npm run check`, then `git diff --exit-code r/` so a PR can't forget to rebuild `r/`. Later: tests and a site build. |
| Community | Enable GitHub Discussions; add `CODEOWNERS`; label set (component, block, a11y, rtl, good first issue). |

**Call-out: this is the repo's first GitHub Actions workflow.** Things to know before approving:
- The repo is public, so Actions minutes on standard GitHub-hosted runners are free and don't draw on the account's private-repo quota (the quota that ran out on another project doesn't apply here).
- Pages currently deploys "from a branch". The CI check doesn't change that. The docs migration (Phase 4) **will** require switching Pages to "GitHub Actions" as the source, which is a settings change you make in the GitHub UI; I'll flag it in that PR.
- Third-party actions pinned to full commit SHAs; `permissions: contents: read` by default.
- Optional: make the check required via branch protection on `main` once it's green.

---

## 6. Phased roadmap

Small PRs, each shippable on its own, in this order. One PR per row unless noted. Each PR follows CLAUDE.md and the testing checklist in the brief.

### Phase 1 — Go public-ready (vanilla site, no new features)

| PR | Changes | How to test |
| --- | --- | --- |
| 1.1 OSS basics | LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CHANGELOG (backfilled v0.1), issue + PR templates, mark `upgrade-brief.md` superseded. | Files render on GitHub; templates appear on "New issue". |
| 1.2 CI check | `.github/workflows/check.yml` (§5). | PR shows a passing check; a deliberate stale `r/` file makes it fail (tested on a throwaway commit, then reverted). |
| 1.3 Positioning copy | Everything in §1.3 for site chrome, home, docs pages, README; remove plans section and Pro tags (per §2.3); hide Figma page and chips; footer/right-rail links to GitHub. | Grep shows no "ParseLab apps", "Shopify", "internal", "our developers"; every touched page loads, `typeof COMP_ORDER !== 'undefined'`, no console errors; light/dark, 375 px. |
| 1.4 Demo content | Replace Printly / Lumen Prints / `parselab.com` / Shopify copy in component examples (§1.3 table) with the fictional brand. Blocks/examples get a minimal text swap only (full rebuild is Phase 5). | Same as 1.3 plus each component page with a changed example. |
| 1.5 Contrast + Modal focus | Token fixes for `--text-3`, white-on-brand, success badges (site CSS + `theme`/`tokens` items); site Modal uses `modalOpen()`. | Contrast measured ≥ 4.5:1 in light and dark; Tab cycles inside Modal; `npm run check`. |

### Phase 2 — Registry quality foundations

| PR | Changes | How to test |
| --- | --- | --- |
| 2.1 Test harness | Vitest + Testing Library + `vitest-axe` + jsdom; one smoke test per existing component (renders, axe passes); `npm test` added to CI. | `npm test` green locally and in CI. |
| 2.2 RTL sweep | Logical classes and `rtl:` flips across all 20 affected files; Drawer `side` gains `start`/`end`. | RTL test renders each with `dir="rtl"`; visual check in a scratch app; `npm run check`. |
| 2.3 Controlled state | Data table controlled sorting/selection/pagination; audit and add `asChild` where missing. | New tests for controlled + uncontrolled usage. |
| 2.4 Extract + rename | Publish `popover`, `calendar`; `radio` → `radio-group` (alias kept); Combobox / Date picker depend on them. | Install into a fresh `shadcn init` app (Next) and a Vite app; both build and render. |

### Phase 3 — Domain and distribution (needs §2.1 decision)

| PR | Changes | How to test |
| --- | --- | --- |
| 3.1 Domain | `CNAME`, update `homepage` and all 41 `registryDependencies` URLs to the new domain. | `curl` 200 on new `/r/*.json`; old GitHub Pages URLs redirect; fresh install works. |
| 3.2 Namespace | Docs and README show `@parseui/<name>`; submit to the shadcn registry directory (outside the repo). | `npx shadcn add @parseui/button` in a fresh app. |

### Phase 4 — Docs site migration (2–3 PRs)

| PR | Changes | How to test |
| --- | --- | --- |
| 4.1 Scaffold | Next.js + Fumadocs app in `apps/docs` (or `site/`), static export, Pages deploy workflow; serves `r/` unchanged; hash-route redirect shim; Getting started + Foundations pages ported. **Requires switching Pages source to GitHub Actions.** | Preview deploy; old `#/docs/button` link lands on the new page; `/r/button.json` still 200. |
| 4.2 Components | One MDX page per component rendering the real component, props tables from types, keyboard tables, theme + RTL toggles per preview, customizer ported. Retire `index.html`. | Every component page loads with no console errors; Lighthouse a11y ≥ 95; 375 px. |
| 4.3 Search + extras | Search, copy-page-as-Markdown, "Powered by" deps, open preview in new tab, `llms.txt`, sitemap, OG images. | Search finds every component; Markdown copy matches page. |

### Phase 5 — Blocks (one PR per category)

Order: Auth → App shell → Dashboard → Data → Settings → Marketing → Onboarding → Feedback → E-commerce. Each PR adds the `registry:block` items for that category (§4.3), the gallery pages, and tests. Test: install each block into a fresh app, renders at 375 / 768 / 1280 px, light/dark/RTL, axe clean.

Then the two examples are rebuilt from blocks (SaaS dashboard, Settings), followed by the new examples.

### Phase 6 — Missing components (batches of 3–5 related items per PR)

Tier 1 first (§3.3), grouped: (Label, Separator, Skeleton, Spinner) → (Alert dialog, Sheet, Collapsible) → (Toggle, Toggle group, Radio group polish) → (Scroll area, Hover card) → (Field/Form, Input group, Button group). Then Tier 2 (Sidebar and Chart each get their own PR). Each PR meets §3.1 in full.

Some Tier 1 components are needed by blocks (Separator, Skeleton, Label, Sheet, Sidebar). Where a block category needs one, that component PR goes just before it; I'll keep the order flexible on that point and note it in each PR.

### Phase 7 — 1.0

Craft items from the upgrade brief that still fit (sliding tab indicator, switch stretch, animated numbers, status dot, avatar ring/status), contribution docs polish, launch post, tag `v1.0.0`.

---

## 7. What I need from you to start

1. Name and domain (§2.1).
2. License holder name (§2.2).
3. Fully free vs keep a Pro door open (§2.3).
4. Docs migration yes/no (§2.4).
5. Which phase to start. My suggestion: **Phase 1**, starting with 1.1 and 1.2, which don't depend on any of the decisions above.
