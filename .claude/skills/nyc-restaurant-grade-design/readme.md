# NYC Restaurant Grade — Design System

A small, focused design system distilled from **NYC Restaurant Grade**, a
single-file static web app that looks up NYC Health Department (DOHMH)
inspection grades by restaurant name. The product is one screen: you type a
restaurant name (or paste a Google Maps link) and it returns the official
letter grade, score, and last inspection details from the city's open-data API.

The system's job is to let designers and agents produce new screens, marketing
pages, and assets that look and feel exactly like this app: **dark, native,
mobile-first, and ruthlessly utilitarian**, anchored by one signature device —
the color-coded grade chip (A green, B amber, C red).

---

## Sources

This system was reverse-engineered from the live product and its source:

- **Live app:** https://shihhsien.github.io/tools/nyc-restaurant-grade.html
- **Repo:** https://github.com/shihhsien/tools
  - `nyc-restaurant-grade.html` — the entire app (HTML + CSS + JS in one file)
  - `CLAUDE.md` — extensive engineering notes (Maps-link resolution, SoQL
    escaping, progressive name fallback, testing, versioning)
- **Data source:** NYC Open Data / Socrata API, dataset `43nn-pn8j` (DOHMH
  restaurant inspection results).

> Explore the repository above to build higher-fidelity work — the single HTML
> file is the literal source of truth for every color, size, and string in this
> system. Nothing here is invented; it is lifted verbatim where possible.

---

## Content fundamentals

The voice is a **calm, precise civic utility** — it sounds like a helpful city
clerk, never a marketer. It states facts, owns its limits, and tells you exactly
what to do next.

- **Person & address.** Second person, imperative for actions ("Enter a
  restaurant name.", "Look up grade"). First person only when the app owns a
  failure ("Couldn't find a restaurant name in this link."). Never "we".
- **Tone.** Factual, exact, slightly terse. Every number is qualified with its
  provenance ("official data", "Official NYC Health Dept data (DOHMH)").
- **Honesty about limits.** Error copy never blames a third party or hand-waves.
  It explains the real situation and gives a concrete recovery path: *"Couldn't
  find a restaurant name in this link. Open it ↗ — once the map loads, copy the
  full URL from the address bar and paste it here, or type the name above."*
- **Casing.** Sentence case for everything human-facing (titles, buttons,
  status). UPPERCASE is reserved for two machine contexts: the eyebrow divider
  label ("OR PASTE A LINK") and echoed search terms in status
  (`shortened from "OITA SUSHI"`).
- **Status as narration.** The status line narrates the machine's reasoning in
  plain language: `1 match · official data`, `Trying "Oita"…`,
  `Resolving Maps link…`, `2 matches · shortened from "OITA SUSHI"`. The
  middot ` · ` is the standard separator between status clauses.
- **Numbers & units.** Score and grade always carry their label
  (`Grade A · score 12 · graded Mar 3, 2025`). Dates are
  `MMM D, YYYY` (`Mar 3, 2025`). Em dash `—` is the empty-value placeholder.
- **Emoji.** None. The only non-text glyph anywhere is the `↗` (U+2197) on
  outbound links. Keep it that way.
- **Microcopy specimens.**
  - Page subtitle: *"Official NYC Health Dept data (DOHMH). Name + optional
    location (street, borough, or ZIP — not neighborhood)."*
  - Empty guard: *"Enter a restaurant name."*
  - No results: *"No active record for "X". Try a shorter name, drop the
    location, or check spelling."*
  - Pending grade: *"No letter grade on record yet (latest score 9)"*

---

## Visual foundations

**Overall vibe.** A dark, flat, iOS-native utility. No chrome, no ornament, no
stock imagery. The interface is a stack of rounded-rectangle surfaces on a
near-black field, with one bright white button. The signature device is the
**NYC grade placard** — the iconic white DOHMH window card, faithfully
recreated, glowing against the dark UI; its compact cousin (the `GradeBadge`
chip) carries grades in dense lists. It reads as a civic system tool, not a
website.

- **Color.** Near-black page (`#0b0b0c`) → slightly lighter card (`#161617`) →
  1px line (`#2a2a2c`). Text steps down in three greys
  (`#f4f4f5` → `#9b9ba1` → `#52525b`). The grade scale is the only place
  saturated color appears in content; link blue (`#60a5fa`) is links only; a
  faint indigo-tinted field (`#1a1a2e`) distinguishes the Maps-link input. The
  primary button inverts the whole scheme — white fill, black text.
- **The grade colors are authentic NYC.** This system uses the real DOHMH
  placard palette, not a traffic light: **blue A** (`#1f57a6`, 0–13 points),
  **green B** (`#2f8b4e`, 14–27), **orange C** (`#c96f20`, 28+), and a
  **black-and-white "grade pending"** card for restaurants under appeal. There
  is deliberately *no red* in grading — even a C is a calm orange; red is
  reserved for one thing only, the ⚠ Closed-by-DOHMH banner. The C was
  darkened from the photographic placard orange in v1.24 for contrast
  (#e07d2a is 2.94:1 on white, failing the 3:1 large-text floor). Dense
  variants (`--grade-b-dense` #21703e, `--grade-c-dense` #a05819) exist for
  the 22px history mini-chips, whose 11px white text needs 4.5:1. The blue A
  doubles as the brand's institutional color (`--nyc-blue`).
- **Type.** The native system UI stack
  (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`) on a **modular
  scale, ratio 1.25** anchored at 16px: 11 · 13 · 16 · 20 · 25 · 31. Weights are
  400/600/700 only; 600 carries all emphasis (names, buttons, labels), 700 is
  reserved for the grade letter and hero numerals. Mono appears once, in the
  `?debug=1` trace panel.
- **Spacing.** Tight, mobile rhythm built on a 2/4/8/16 logic. 16px page
  padding, 8px row gaps, 12–14px field/card padding, 12px between cards. Content
  is capped at 600px and left-aligned — it never centers or grows wide.
- **Backgrounds.** Flat solid fills only. No gradients, no images, no textures,
  no patterns. Depth comes entirely from the card fill being one step lighter
  than the page plus a 1px border.
- **Borders & radii.** Everything is a crisp 1px hairline. Radii escalate by
  role: 8px (debug) → 10px (grade chip) → 12px (inputs, buttons) → 14px (cards).
  Soft but not pill-round; nothing is fully rounded except by intent.
- **Shadows.** None in the base app — it is deliberately flat. A single overlay
  shadow token exists for menus/dialogs the original never needed.
- **Elevation model.** Communicated by *value*, not shadow: page is darkest,
  cards are lighter, borders separate. That's the whole system.
- **Animation.** Near-none, by intent. Two motion tokens exist:
  `--motion-fast` (120ms ease) for focus/hover/press transitions, and
  `--motion-base` (220ms, gentle out-curve) for content entrances (results
  rising in). Always gate entrances on `prefers-reduced-motion`. No loops, no
  bounces, no parallax.
- **Focus.** Every interactive element shows `--focus-ring` (a 3px NYC-blue
  halo) plus a blue border on keyboard focus. Inputs show it on any focus;
  buttons only on `:focus-visible`.
- **Hover / press.** Touch-first, so there are no hover styles. The press state
  is a single move: `button:active { opacity: .7 }`. Tap highlight is killed
  globally (`-webkit-tap-highlight-color: transparent`). Adopt opacity-dim as
  the universal press affordance; if you add hover for pointer devices, keep it
  to a subtle opacity or one-step-lighter fill — never a color shift.
- **Transparency & blur.** Not used. Surfaces are fully opaque. (Grade-tinted
  translucent backgrounds are a sanctioned *extension* — see the GradeBadge soft
  variant — but the base product has none.)
- **Cards.** A card is: `#161617` fill, 1px `#2a2a2c` border, 14px radius, 14px
  padding, 12px top margin between siblings. No shadow. That single recipe is
  the entire surface system.
- **Layout rules.** Single column, max-width 600px, 16px gutters. One fixed
  element: the version footer pinned to the bottom edge (`v1.12.9`), full-width,
  with a 1px top border and tertiary-grey text.
- **Imagery.** There is none, and that is a brand decision. Don't add stock
  photography or illustration; if a surface feels empty, solve it with type and
  the grade chip.

---

## Iconography

The app is **nearly icon-free**, but v1.24 sanctioned a small set of unicode
glyphs — used as text, never as an icon font or SVG set:

- **No icon font, no SVG sprite, no PNG icons.** All "icons" are unicode
  characters inline in text.
- **The sanctioned glyphs:** `↗` (outbound links — "Map ↗", "Yelp ↗",
  "Open it ↗"), `📍` (the one emoji, on the "Graded restaurants near me"
  button), `⚠` (closure banner), `✓` ("No violations", "Done"),
  `▲▼▬` (trend up/down/flat), `▸▾` (disclosure carets on collapsible
  sections), `·` (the universal meta/status separator).
- **Favicon / app icon:** the blue "A" chip — `assets/favicon.svg` + PNG
  sizes, generated from the logomark.
- Keep new glyphs out unless production adopts them; don't substitute an
  icon library for any of the above.
- **No logo / favicon.** The base app ships no logomark; this design system
  adds one — see the `Logomark` component and the "Logomark & lockups" brand
  card. It is built entirely from the existing grade chip (the green "A") plus
  the wordmark, so it introduces no new visual vocabulary. The PWA title is
  "NYC Grade".
- **No emoji.** Anywhere. Ever.

**If you must add icons** for a richer surface (e.g. a settings screen the base
app lacks), use a thin, geometric, single-stroke set — **Lucide** (1.5–2px
stroke) is the closest match to the app's hairline aesthetic and is
CDN-available. Treat this as a flagged substitution, not a brand asset, and keep
icons monochrome in `--text-secondary`.

---

## Index

Root manifest of this design system:

| Path | What |
|---|---|
| `styles.css` | Global entry point (consumers link this). `@import`s only. |
| `tokens/fonts.css` | `@font-face` for Liberation Sans Narrow (the shipped placard font). |
| `tokens/colors.css` | Base palette + semantic aliases (surfaces, text, grade scale). |
| `tokens/typography.css` | System font stack, weights, px type scale, leading. |
| `tokens/spacing.css` | Spacing scale, radii, layout caps, the flat-elevation note. |
| `tokens/interaction.css` | Motion durations, the NYC-blue focus ring, press opacity. |
| `readme.md` | This guide. |
| `SKILL.md` | Agent Skill manifest for downloading into Claude Code. |

**Foundation cards** (Design System tab) — `cards/*.html`:
colors (neutrals, grade scale, accents), type (title/body/grade specimens),
spacing & radii, the card recipe, microcopy voice, and brand
(logomark/lockups, the grade placard, favicon/app-icon).

**Brand assets** — `assets/`:
`favicon.svg` (crisp scalable mark), `favicon-16/32/48.png` (browser tabs),
`favicon-180.png` (iOS touch icon), `favicon-192/512.png` (PWA tiles). All are
the blue "A" grade chip — link them with `<link rel="icon" …>`.

**Components** — `components/`:

| Component | Role |
|---|---|
| `Logomark` | The brand mark — grade chip + wordmark lockup (horizontal/stacked/icon). |
| `GradePlacard` | The iconic NYC window placard, production spec (hero for single results). |
| `GradeBadge` | The compact color-coded grade chip (A/B/C/other; solid + soft). |
| `Button` | Primary inverted (white) + secondary dark-outlined action buttons. |
| `Chip` | Small tappable chip (recently-searched row). |
| `Input` | Form field (default + Maps-link "accent" variant). |
| `Divider` | Eyebrow "OR PASTE A LINK" labeled rule. |
| `Card` | The base surface (fill + 1px border + 14px radius). |
| `StatusLine` | Narration / error status text. |
| `ScoreBar` | 4px score track with B/C threshold ticks + proximity note. |
| `Trend` | ▲ Improving / ▼ Declining / ▬ No change vs. previous inspection. |
| `ViolationsList` | Collapsible violations with Critical/Not-Critical flag chips. |
| `InspectionHistory` | Collapsible timeline with dense-color mini grade chips. |
| `ClosureBanner` | ⚠ Closed-by-DOHMH banner — the system's only red element. |
| `ResultCard` | Fully-composed result — the production v1.24 card anatomy. |

**UI kit** — `ui_kits/grade-lookup/`:
high-fidelity, interactive recreation of the full app (search, link paste,
results, no-results, pending grade, error states).

**Template** — `templates/grade-lookup/`:
the same screen packaged as a copyable starting folder for consuming projects
(`index.html` + `App.jsx` + `Header.jsx` + `ds-base.js` — one line to repoint
at the bound design system).

---

## A note on fonts

The UI uses the **native system font stack** by design — no webfont needed.
The one exception is the **grade placard**, which production sets in Arial
Narrow. Arial Narrow is a commercial Monotype font we can't redistribute, so
this system ships **Liberation Sans Narrow** (Red Hat's open,
metric-compatible Arial Narrow replacement, v1.07.x) in `assets/fonts/` with
`@font-face` rules in `tokens/fonts.css`. The placard token falls back through
`"Liberation Sans Narrow" → "Arial Narrow" → Arial`, so on machines that do
have Arial Narrow the rendering is effectively identical. **Flagged
substitution:** if you'd rather ship Arial Narrow itself, drop the licensed
`.ttf` into `assets/fonts/` and I'll repoint the token.
