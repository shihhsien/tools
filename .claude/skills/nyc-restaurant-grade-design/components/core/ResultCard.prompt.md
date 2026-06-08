A fully-composed DOHMH inspection result card — the app's core output. Composes `Card` + `GradeBadge`; don't rebuild it by hand.

```jsx
<ResultCard
  grade="A" name="Joe's Pizza"
  address="7 Carmine St, Manhattan 10014"
  score={12} gradedDate="Mar 3, 2025"
  inspectedDate="Mar 3, 2025" inspectionType="Cycle Inspection"
  violation="Non-food contact surface improperly constructed." criticalFlag="Not Critical"
/>

<ResultCard pending name="New Spot" address="…" score={9} inspectedDate="May 1, 2025" />
```

Notes:
- `pending` swaps the detail line to the amber "No letter grade on record yet" copy and shows a `?` chip.
- Pass dates pre-formatted as `MMM D, YYYY`. Use `—` for unknown values to match the app.
