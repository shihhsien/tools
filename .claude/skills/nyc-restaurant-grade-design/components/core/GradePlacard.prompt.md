A faithful recreation of the iconic NYC restaurant grade window placard — the single most recognizable piece of NYC municipal design. Use it as the brand hero, a result's headline, or an empty-state motif. For dense lists, use the compact `GradeBadge` instead.

```jsx
<GradePlacard grade="A" />              {/* blue, 0–13 points */}
<GradePlacard grade="B" size={160} />   {/* green, 14–27 */}
<GradePlacard grade="C" />              {/* orange, 28+ */}
<GradePlacard grade="PENDING" />        {/* black & white, under appeal */}
```

Notes:
- The palette is authentic to the real placards: blue A, green B, orange C, black-and-white pending. Don't recolor it.
- It's a white object — it's designed to sit on the app's dark background and pop. Give it room; don't shrink below ~140px wide or the footer text stops reading.
