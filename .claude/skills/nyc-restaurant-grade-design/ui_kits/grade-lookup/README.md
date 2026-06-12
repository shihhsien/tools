# Grade Lookup — UI Kit

A high-fidelity, interactive recreation of the **NYC Restaurant Grade** app —
the product's single screen, end to end. It composes the design system's core
components (`Input`, `Button`, `Divider`, `StatusLine`, `ResultCard`,
`GradeBadge`) over the shared tokens in `styles.css`.

## Files

| File | Role |
|---|---|
| `index.html` | Mounts the app. Loads React + Babel + `_ds_bundle.js`, then the JSX. |
| `App.jsx` | Interactive logic: mock DOHMH lookup, progressive word-drop fallback, Maps-link name extraction, all UI states. Exposes `window.GradeLookupApp`. |
| `Header.jsx` | `Header` (title + subtitle) and `SearchPanel` (the two inputs + divider + Maps field + button). Exposes `window.GradeLookupKit`. |

## What's interactive

- **Search** — type a name (or tap a "Try a search" chip) and press Enter or
  tap **Look up grade**. A brief "Searching DOHMH records…" loading state
  runs, then results rise in (entrance gated on reduced motion).
- **Labeled fields** — visible labels (with the location guidance inline)
  instead of placeholder-only; full keyboard focus rings throughout.
- **Score in context** — every graded result shows the `ScoreScale` meter
  placing its score on the A 0–13 / B 14–27 / C 28+ bands.
- **Optional location** — add a borough/street/ZIP to filter.
- **Progressive fallback** — type `OITA SUSHI`; the lookup drops the trailing
  word, finds `OITA`, and the status shows `… · shortened from "OITA SUSHI"`.
- **Paste a Maps link** — paste e.g.
  `https://www.google.com/maps/place/Mazzat/…` and the name is extracted, the
  field fills, and the search fires. A coordinate/garbage link shows the
  app's real recovery-path error copy.
- **States covered** — empty guard, suggestions, loading, single/multi match,
  no-record, A/B/C grades, pending (no letter grade yet), and the Maps-link
  error. Status updates announce via `aria-live`.

> Data is mocked from a handful of real-shaped DOHMH rows so the kit runs with
> no network. The live app queries Socrata dataset `43nn-pn8j`.
