Action buttons — both production styles.

```jsx
<Button onClick={search}>Look up grade</Button>
<Button variant="secondary" onClick={near}>📍 Graded restaurants near me</Button>
<Button disabled>Looking up…</Button>
```

Notes:
- One primary (white) button per screen. "secondary" is the dark, hairline-bordered style used for the geolocation action — it sits directly under the primary with an 8px gap.
- Press state is opacity-dim on both. Always full-width by design.
