A dark text field at the app's 16px size (which also prevents iOS zoom). Two variants only.

```jsx
<Input placeholder="Restaurant name" />
<Input placeholder="Street, borough, or ZIP (optional)" />
<Input variant="accent" placeholder="Paste a Google Maps link…" />
```

Notes:
- `variant="accent"` uses the indigo-tinted fill (`--surface-accent`) + indigo border — reserved for the Maps-link paste field, the one place the app deviates from the standard field.
- Keep font-size at 16px (the default) on mobile so iOS doesn't zoom on focus.
