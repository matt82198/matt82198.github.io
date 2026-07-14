# Section Component Contract

This document specifies the ownership and constraints for section components in the portfolio site.

## Overview

Each section (Hero, Aesop, ClientWork, Writing, PrivateWork, TwoAIReview, FleetViz, Timeline) is a self-contained `.astro` component with zero props. All styling uses only `tokens.css` custom properties. No external network dependencies are permitted.

## Design Constraints

1. **System fonts only** — Use `var(--font-sans)` for prose and `var(--font-mono)` for data/code. No external font imports or CDNs.

2. **Color & theming** — ONLY use CSS custom properties from `tokens.css`:
   - `--color-bg`, `--color-bg-secondary`, `--color-text`, `--color-text-secondary`, `--color-text-tertiary`, `--color-border`, `--color-code-bg`, `--color-code-text`
   - `--accent`, `--accent-light`, `--accent-lighter`
   - Light/dark theme switching via `prefers-color-scheme` or `data-theme` attribute — no inline conditionals.

3. **Spacing & scale** — Use spacing scale from tokens (`--space-*`) and type scale (`--text-*`, `--leading-*`).

4. **Semantic HTML**
   - One `<h2>` per section with a stable `id` attribute (lowercase, matches nav anchor):
     - `id="hero"` (Hero section)
     - `id="aesop"` (Aesop section)
     - `id="clientwork"` (ClientWork section)
     - `id="writing"` (Writing section)
     - `id="privatework"` (PrivateWork section)
     - `id="review"` (TwoAIReview section)
     - `id="fleet"` (FleetViz section)
     - `id="timeline"` (Timeline section)
   - No external links beyond GitHub; no iframes, no embeds.

5. **Accessibility**
   - Visible focus rings on all interactive elements (use `--focus-ring` token).
   - Semantic headings, alt text for images (if any).
   - Honor `prefers-reduced-motion` — no animations on first render; use `@media (prefers-reduced-motion: reduce)`.

6. **Vanilla script only**
   - Client-side interactivity via `<script>` blocks only.
   - No framework scripts beyond Astro itself.
   - Must honor `prefers-reduced-motion` in JavaScript.

7. **Network policy**
   - **Zero external requests** — no analytics, no font CDNs, no image CDNs, no third-party JS.
   - All data embedded or computed locally.
   - No `fetch()`, `XMLHttpRequest`, or WebSockets.

8. **Ownership & modification**
   - Each component owns only its own `.astro` file.
   - **DO NOT modify** files outside your component:
     - `src/styles/tokens.css` (contract and unchanging)
     - `src/styles/global.css` (global reset; don't modify)
     - `src/layouts/Base.astro` (site chrome)
     - `src/pages/index.astro` (page composition)
     - `.github/workflows/deploy.yml`
     - `astro.config.mjs`
     - `package.json`
   - If you need a new token or global style, raise it as an issue/PR discussion — don't unilaterally edit tokens.css.

## Opening Pattern

Every section should open with a tiny italic "moral" in the Aesop fable style — wry, classy, one-liner. Example:

```astro
<p class="section-moral"><em>The carpenter builds best when the wood knows where it's meant to go.</em></p>
```

Style this with:
```css
.section-moral {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-4);
}

.section-moral em {
  font-style: italic;
  color: var(--color-text-tertiary);
}
```

## Component Inventory

| Component | File | Anchor ID | Owner |
|-----------|------|-----------|-------|
| Hero | `src/components/sections/Hero.astro` | `#hero` | TBD |
| Aesop | `src/components/sections/Aesop.astro` | `#aesop` | TBD |
| ClientWork | `src/components/sections/ClientWork.astro` | `#clientwork` | TBD |
| Writing | `src/components/sections/Writing.astro` | `#writing` | TBD |
| PrivateWork | `src/components/sections/PrivateWork.astro` | `#privatework` | TBD |
| TwoAIReview | `src/components/sections/TwoAIReview.astro` | `#review` | TBD |
| FleetViz | `src/components/sections/FleetViz.astro` | `#fleet` | TBD |
| Timeline | `src/components/sections/Timeline.astro` | `#timeline` | TBD |

## Testing Checklist

Before committing changes to a section:

- [ ] Component builds without errors (`astro build` succeeds)
- [ ] `h2` anchor id matches contract
- [ ] All colors use custom properties (no hex/rgb)
- [ ] Fonts are system fonts only (no `@import`, no CDN)
- [ ] Focus rings visible on interactive elements
- [ ] Reduced-motion honored (`@media (prefers-reduced-motion: reduce)`)
- [ ] No external network requests
- [ ] Works in light and dark theme

## References

- **Design tokens**: `src/styles/tokens.css`
- **Global styles**: `src/styles/global.css`
- **Layout**: `src/layouts/Base.astro`
- **Page composition**: `src/pages/index.astro`
- **Astro docs**: https://docs.astro.build
