The signature color-coded inspection-grade chip — use anywhere a DOHMH letter grade appears (result cards, lists, summaries).

```jsx
<GradeBadge grade="A" />
<GradeBadge grade="C" size={40} />
<GradeBadge grade="N/A" />          {/* neutral pending grey, auto-shrinks text */}
<GradeBadge grade="B" soft />        {/* tinted/translucent variant */}
```

Variants & props:
- `grade` — "A"/"B"/"C" map to pass-green / caution-amber / fail-red; any other value (e.g. "N/A", "?") uses pending grey at smaller text.
- `soft` — translucent tinted fill with a 1px inset ring; for low-emphasis contexts. Default is the solid fill used in the app.
- `size` — px square; text scales with it. The app default is 48.
