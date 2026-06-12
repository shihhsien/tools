Collapsible inspection-history timeline (production shows up to 6 rows).

```jsx
<InspectionHistory history={[
  { date: "Mar 3, 2025", grade: "A", score: 12, type: "Re-inspection" },
  { date: "Jan 20, 2025", grade: "B", score: 19, type: "Initial" },
  { date: "Aug 2, 2024", closed: true, score: 52, type: "Initial" },
]} />
```

Notes:
- Mini B/C chips deliberately use the darker dense shades (`--grade-b-dense`, `--grade-c-dense`) — 11px white text needs 4.5:1 contrast. Don't "fix" them to match the big chips.
- Renders nothing with <2 entries (no trend to show).
