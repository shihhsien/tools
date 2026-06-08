The brand logomark — the grade chip as the mark, optionally locked up with the wordmark. This is the brand's primary identity (the product ships no separate logo).

```jsx
<Logomark />                              {/* horizontal: green A chip + wordmark */}
<Logomark layout="stacked" size={64} />   {/* chip over centered wordmark */}
<Logomark showWordmark={false} size={64} />{/* mark only — app icon / favicon */}
```

Rules & variants:
- The chip is the brand element; keep it the green "A" for identity use. The `grade`/B/C recolors exist for editorial/illustrative contexts only — don't use a C-red chip as the app logo.
- Wordmark is two-tone: "NYC Restaurant" in primary ink, "Grade" in secondary grey.
- For an app icon, wrap a `showWordmark={false}` mark in a rounded card (`--surface-card`, 1px border, ~22% radius).
