<p align="center">
  <img src="assets/parseui-logo-light-bg.svg" alt="ParseUI" height="56">
</p>

<p align="center">The design system and React UI library for ParseLab apps.</p>

<p align="center"><b>Live preview:</b> <a href="https://aowshad.github.io/parseui/">aowshad.github.io/parseui</a></p>

---

> **Status: v0.1 preview.** This repo hosts the documentation site and the ParseUI component registry. Every base component has real React source in [`registry/`](registry/), installable with the shadcn CLI. The live previews on the site are still HTML/CSS stand-ins of those components. `@parseui/icons` is a proposal, not a published package yet.

## Install a component

In any project set up with `shadcn init`:

```bash
npx shadcn@latest add https://aowshad.github.io/parseui/r/theme.json   # optional: the ParseUI palette
npx shadcn@latest add https://aowshad.github.io/parseui/r/switch.json
```

Every component is published at `https://aowshad.github.io/parseui/r/<name>.json`. See [registry/README.md](registry/README.md) to add or change one.

## What's in the preview

- **Foundations:** colors (brand ramp, neutrals, semantic), typography, spacing, radius, shadows, icons
- **29 base components**, each with preview/code, light/dark preview, install steps, usage, examples and an API table
- **14 blocks**, grouped by category: sign in, welcome screen, setup guide (Onboarding); page header, resource list, settings section, stats row, notification settings, empty state, file upload (App pages); pricing, plan and usage (Billing); review request, help and support (Engagement)
- **2 examples**, store dashboard and app settings (with an unsaved changes bar), built only from ParseUI parts
- **Live customizer** (palette icon in the top bar): change brand color, radius and theme, and the whole site reskins
- **⌘K / `/` search**, keyboard support, responsive layout, reduced-motion support

## Run it locally

No build step for the site. It's one static HTML file. Serve it over HTTP so the Manual install tab can load the source from `r/`.

```bash
git clone https://github.com/aowshad/parseui.git
cd parseui
python3 -m http.server 8080
# open http://localhost:8080
```

Opening `index.html` directly in a browser also works.

## Deploy to GitHub Pages

1. Push this repo to GitHub (see commands below).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. Wait about a minute. The site is live at `https://<username>.github.io/<repo>/`.

Every push to `main` redeploys automatically.

## Project structure

```
.
├── index.html                      # the whole site: styles, components, router
├── registry.json                   # shadcn registry: one item per component
├── registry/parseui/ui/            # React source for every component
├── r/                              # built registry JSON (npm run registry:build), served by Pages
├── package.json                    # dev tools for the registry only
├── assets/
│   ├── favicon.svg
│   ├── parseui-logo-light-bg.svg
│   └── parseui-logo-dark-bg.svg
├── .nojekyll                       # serve files as-is on GitHub Pages
└── README.md
```

Routes use hash URLs (`#/docs/button`), so deep links work on GitHub Pages without any server config.

## Roadmap

The current upgrade plan, phase by phase with status, is in [docs/upgrade-brief.md](docs/upgrade-brief.md).

1. **Now:** foundations and base components
2. **Next:** blocks and sections
3. **Then:** full admin dashboard examples
4. **Later:** public release (free core, Pro blocks and templates)

Planned: Next.js docs site, Tailwind v4 tokens, real React components on Radix, a matching Figma library with variables and Code Connect.

---

Made by ParseLab, Dhaka.
