A small tappable chip, as used in the app's "recently searched" row.

```jsx
<div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
  <Chip onClick={() => run("JOE'S PIZZA")}>JOE'S PIZZA</Chip>
  <Chip onClick={() => run("OITA")}>OITA · MANHATTAN</Chip>
</div>
```

Notes:
- Lay chips out in a flex row with 6px gap.
- Production pairs the row with a borderless underlined "clear" text button.
