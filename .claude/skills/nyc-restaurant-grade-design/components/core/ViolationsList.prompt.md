Collapsible list of the latest inspection's violations, critical-first.

```jsx
<ViolationsList violations={[
  { desc: "Evidence of mice or live mice present.", flag: "Critical", code: "04L", category: "Pests" },
  { desc: "Non-food contact surface improperly constructed.", flag: "Not Critical", code: "10F" },
]} />
<ViolationsList violations={[]} />   {/* ✓ No violations at last inspection */}
```

Notes:
- Summary line reads "▸ N violations · M critical"; the ▸/▾ carets are the production disclosure affordance.
- Critical flag chips are orange-tinted (C color), never red — red is reserved for closures.
