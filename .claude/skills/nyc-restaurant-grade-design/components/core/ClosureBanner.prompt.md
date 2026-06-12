The "currently closed" banner — sits at the very top of a result card, before the grade row.

```jsx
<ClosureBanner date="Apr 9, 2025" />
```

Notes:
- This is the one red element in the system (error-red translucent fill). Reserve it for actual DOHMH closures — never reuse for general warnings.
- `ResultCard` renders it automatically via its `closedDate` prop.
