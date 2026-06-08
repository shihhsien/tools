---
name: nyc-restaurant-grade-design
description: Use this skill to generate well-branded interfaces and assets for NYC Restaurant Grade, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## What's here

- `styles.css` — the single global entry point. Link this to inherit every token. It `@import`s the token files in `tokens/`.
- `tokens/` — `colors.css` (dark surface ramp, the A/B/C grade scale, accents), `typography.css` (system font stack + px scale), `spacing.css` (spacing, radii, the flat-elevation note).
- `components/core/` — React primitives: `GradeBadge`, `Button`, `Input`, `Divider`, `StatusLine`, `Card`, `ResultCard`. Each has a `.d.ts` (props) and `.prompt.md` (usage).
- `ui_kits/grade-lookup/` — interactive recreation of the full app.
- `cards/` — foundation specimen cards (colors, type, spacing, voice).
- `README.md` — the full design guide (voice, visual foundations, iconography).

## The one-paragraph brief

Dark, flat, mobile-first civic utility. Near-black page (`#0b0b0c`), cards one step lighter (`#161617`) with a 1px hairline border and 12–14px radius, no shadows. System UI font at small sizes; weight 600 carries emphasis, 700 only on the grade letter. The hero device is the color-coded grade chip — A green, B amber, C red, neutral grey for ungraded. One white inverted button per screen with an opacity-dim press state. No imagery, no gradients, no emoji; the only glyph is `↗` on outbound links. Copy is calm and factual, owns its limits, and always offers the next step.
