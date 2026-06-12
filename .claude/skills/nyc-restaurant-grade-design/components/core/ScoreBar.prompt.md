The production score bar — places an inspection score on a 4px track (filled score/40 in the grade's color) with faint B/C threshold ticks and a proximity note where it matters.

```jsx
<ScoreBar score={12} grade="A" />   {/* blue fill, "2 pts from B" note */}
<ScoreBar score={3} grade="A" />    {/* "Excellent" */}
<ScoreBar score={26} grade="B" />   {/* green fill, "2 pts from C" */}
<ScoreBar score={41} grade="C" />   {/* orange fill, capped at 100% */}
```

Notes:
- Lower is better. Ticks sit at B=14 (35%) and C=28 (70%) of the 40-pt track.
- The note only appears when actionable: "Excellent" (A ≤5), "N pts from B" (11–13), "N pts from C" (B at 24–27). Don't force one otherwise.
