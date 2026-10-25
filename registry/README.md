# ParseUI registry

Real React source for every ParseUI component, published as a [shadcn registry](https://ui.shadcn.com/docs/registry).
The docs site (`index.html`) still has no build step. Only the registry JSON is built, and the output in `r/` is committed so GitHub Pages serves it.

```bash
npm install
npm run check            # typecheck + build r/*.json
```

Anyone can then install a component into a shadcn project:

```bash
npx shadcn@latest add https://aowshad.github.io/parseui/r/switch.json
```

## Layout

```
registry.json               # item list: names, deps, files
registry/parseui/ui/*.tsx   # component source, one file per item
registry/parseui/lib/utils.ts  # cn(), only for local typechecking (installs use the project's own)
r/*.json                    # build output, served at /parseui/r/<name>.json
```

Two items are not components:

- `tokens`: status colors (`success`, `warning`, `info`) and derived brand shades. Every component depends on it, and it never overwrites the standard shadcn tokens, so installing a component keeps the project's own brand.
- `theme`: the full ParseUI palette and radius scale for a project that wants the ParseUI look. Opt-in.

## Writing a component

- React 19 style: plain function components, `React.ComponentProps<...>` for props, `ref` as a prop, no `forwardRef`. Add `data-slot="<part>"` to every rendered part.
- Imports: `cn` from `@/lib/utils`, other ParseUI parts from `@/registry/parseui/ui/<file>`, primitives from the unified `radix-ui` package, icons from `lucide-react`.
- Colors come from tokens only, never hex values, so light and dark both work. The only exception is `text-white` on solid destructive surfaces.
- Keyboard and screen-reader behavior first. Prefer a Radix primitive when one exists.
- Animations use `tw-animate-css` (`data-[state=open]:animate-in` and friends, which ships with `shadcn init`) and must have a `motion-reduce:` fallback.
- The public API matches the props table and examples on the docs site. If the site's API needs to change, change the site in the same PR.

### Token map (site CSS → Tailwind class)

| Site variable | Tailwind |
| --- | --- |
| `--bg` | `bg-background` |
| `--bg-subtle` | `bg-muted/50` |
| `--bg-muted`, `--bg-inset` | `bg-muted` |
| `--border` | `border-border` (default border color) |
| `--border-strong` | `border-input` |
| `--text` | `text-foreground` |
| `--text-2` | `text-muted-foreground` |
| `--text-3` | `text-muted-foreground/70` |
| `--p`, `--p-fg` | `bg-primary`, `text-primary-foreground` |
| `--p-hover` | `bg-primary-hover` |
| `--p-soft`, `--p-soft-2` | `bg-primary-soft`, `bg-primary-soft-hover` |
| `--p-text` | `text-primary-text` |
| `--ring` | `ring-ring/40` |
| `--danger`, `--danger-soft` | `destructive`, `destructive-soft` |
| `--success`, `--warning`, `--info` (+ `-soft`) | same names |
| `--r-sm`, `--r`, `--r-lg`, `--r-xl` | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` |

Focus rings: buttons and other controls use `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background`. Text fields use `focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/40`.

## Adding an item to `registry.json`

```json
{
  "name": "switch",
  "type": "registry:ui",
  "title": "Switch",
  "description": "Toggle a setting that takes effect immediately.",
  "dependencies": ["radix-ui"],
  "registryDependencies": ["utils", "https://aowshad.github.io/parseui/r/tokens.json"],
  "files": [{ "path": "registry/parseui/ui/switch.tsx", "type": "registry:ui" }]
}
```

When one component uses another, add that component's full URL to `registryDependencies` too.
