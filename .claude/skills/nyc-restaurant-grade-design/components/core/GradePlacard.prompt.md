The iconic NYC window placard, exactly as the production app renders it (hero above a single result). White card on the dark UI, Arial Narrow, soft shadow.

```jsx
<GradePlacard grade="A" />              {/* blue ink, 200px production size */}
<GradePlacard grade="C" size={150} />   {/* orange ink, scaled */}
<GradePlacard grade="PENDING" />        {/* near-black GRADE PENDING card */}
```

Notes:
- Authentic palette: blue A / green B / orange C ink on white; pending is near-black. Don't recolor.
- Production width is 200px; everything (type, rules, padding) scales with `size`.
- Use as a hero for a single result or brand moments; use `GradeBadge` in dense lists.
