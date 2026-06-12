The inspection trend line — compares the two latest scores (lower is better).

```jsx
<Trend current={12} previous={19} />  {/* ▲ Improving (7 pts) since previous inspection */}
<Trend current={41} previous={19} />  {/* ▼ Declining (22 pts) … in C-orange */}
<Trend current={12} previous={12} />  {/* ▬ No change … muted */}
```

Notes:
- Improving = green ▲, declining = orange ▼, flat = muted ▬. These are the unicode glyphs production uses — don't swap in icons.
- Renders nothing when either score is missing; don't guard externally.
