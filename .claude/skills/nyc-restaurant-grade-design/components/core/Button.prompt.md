The primary action button — full-width, white fill, black label, with opacity-dim press feedback. The product has exactly one button style; use it for the main action on a screen.

```jsx
<Button onClick={search}>Look up grade</Button>
<Button disabled>Looking up…</Button>
```

Notes:
- Always full-width by design (mobile-first). Wrap in a constrained container if you need it narrower.
- Press state is opacity → 0.7 (touch-first); disabled drops to 0.45. No hover color shift, matching the app.
