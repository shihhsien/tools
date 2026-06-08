The base surface — the one card recipe the whole product uses. Flat (no shadow); depth comes from the lighter fill + 1px border.

```jsx
<Card>
  <div className="name">Anything goes here</div>
</Card>
```

Notes:
- No shadow by design. Stack cards with a 12px gap (`margin-top: var(--space-6)`).
- For a fully-composed inspection result, use `ResultCard` instead of hand-building inside `Card`.
