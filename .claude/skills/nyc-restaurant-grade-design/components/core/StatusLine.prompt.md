The status / narration line under the search controls. Speaks in the app's calm, factual voice.

```jsx
<StatusLine>1 match · official data</StatusLine>
<StatusLine>2 matches · shortened from "OITA SUSHI"</StatusLine>
<StatusLine tone="error">Couldn't find a restaurant name in this link. <a href="…">Open it ↗</a></StatusLine>
```

Notes:
- Use ` · ` (middot, spaced) as the clause separator.
- Error copy should always end with a concrete next step, not a blame.
