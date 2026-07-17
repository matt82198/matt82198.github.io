# Portfolio of Matt Culliton

Built by an agent fleet. Astro, deployed to GitHub Pages.

## Aesop stats

The aesop-project stats shown on the site live in `src/data/aesop-stats.json` and are
baked in at build time. They are **git-derived, not hand-maintained** — refresh them with
one command instead of editing the JSON:

```bash
npm run sync:stats            # aesop repo auto-located at ../aesop or ~/aesop
# or point at a specific checkout:
python scripts/sync-aesop-stats.py /path/to/aesop
# or:  AESOP_REPO=/path/to/aesop npm run sync:stats
```

The script re-derives every number from the aesop repo (reusing aesop's own
`tools/self_stats.py` for commits / merged PRs / waves / LOC, and computing domains,
test files, and version from the working tree), prints a before→after diff, and rewrites
the JSON. Follow with `npm run build` to bake the new numbers into `dist/`.
