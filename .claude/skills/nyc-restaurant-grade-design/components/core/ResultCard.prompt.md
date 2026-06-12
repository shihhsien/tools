The fully-composed DOHMH result card — production v1.24 anatomy. Composes `ClosureBanner` + `GradeBadge` + `ScoreBar` + `Trend` + `ViolationsList` + `InspectionHistory`.

```jsx
<ResultCard
  grade="A" name="Joe's Pizza" address="7 Carmine St, Manhattan 10014"
  score={12} gradedDate="Mar 3, 2025"
  inspectedDate="Mar 3, 2025" inspectionType="Cycle Inspection / Re-inspection"
  freshness="Inspected 3 months ago"
  meta={[<span>Pizza</span>, <a href="tel:+12125551234">(212) 555-1234</a>, <a href="#">Map ↗</a>, <a href="#">Yelp ↗</a>]}
  showContext
  violations={[{ desc: "Non-food contact surface improperly constructed.", flag: "Not Critical", code: "10F" }]}
  history={[
    { date: "Mar 3, 2025", grade: "A", score: 12, type: "Re-inspection" },
    { date: "Jan 20, 2025", grade: "B", score: 19, type: "Initial" },
  ]}
/>

<ResultCard pending name="New Spot Cafe" score={9} inspectedDate="May 1, 2025" />
<ResultCard grade="C" name="…" score={41} closedDate="Apr 9, 2025" />  {/* closure banner */}
```

Notes:
- Trend renders automatically when `history` has ≥2 scored rows; the score bar whenever `score` is present.
- `violations={[]}` (empty array) shows "✓ No violations at last inspection"; omit the prop to hide the section entirely.
- Meta-line links are muted-underline (`color: var(--text-secondary)`); outbound ones end with ` ↗`.
