<p align="center">
  <img src="assets/parseui-logo-light-bg.svg" alt="ParseUI" height="56">
</p>

<p align="center">The design system and React UI library for ParseLab apps.</p>

<p align="center"><b>Live preview:</b> <a href="https://aowshad.github.io/parseui/">aowshad.github.io/parseui</a></p>

---

> **Status: v0.1 preview.** This repo hosts the documentation and showcase site for ParseUI. The components on the site are HTML/CSS stand-ins that show how the library will look and be used. Package names (`@parseui/react`, `@parseui/icons`), the `parseui` CLI and the component APIs are proposals, not published packages yet.

## What's in the preview

- **Foundations:** colors (brand ramp, neutrals, semantic), typography, spacing, radius, shadows, icons
- **22 base components**, each with preview/code, light/dark preview, install steps, usage, examples and an API table
- **11 blocks**, grouped by category: sign in, welcome screen, setup guide (Onboarding); page header, resource list, settings section, stats row, notification settings, empty state, file upload (App pages); pricing (Billing)
- **Store dashboard example** built only from ParseUI parts
- **Live customizer** (palette icon in the top bar): change brand color, radius and theme, and the whole site reskins
- **⌘K / `/` search**, keyboard support, responsive layout, reduced-motion support

## Run it locally

No build step. It's one static HTML file.

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
├── assets/
│   ├── favicon.svg
│   ├── parseui-logo-light-bg.svg
│   └── parseui-logo-dark-bg.svg
├── .nojekyll                       # serve files as-is on GitHub Pages
└── README.md
```

Routes use hash URLs (`#/docs/button`), so deep links work on GitHub Pages without any server config.

## Roadmap

1. **Now:** foundations and base components
2. **Next:** blocks and sections
3. **Then:** full admin dashboard examples
4. **Later:** public release (free core, Pro blocks and templates)

Planned: Next.js docs site, Tailwind v4 tokens, real React components on Radix, a matching Figma library with variables and Code Connect.

---

Made by ParseLab, Dhaka.
