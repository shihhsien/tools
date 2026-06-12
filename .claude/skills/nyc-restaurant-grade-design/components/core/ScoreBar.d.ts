import * as React from "react";

/**
 * The production score bar: a 4px track filled proportionally (score/40)
 * in the grade's placard color, with faint B (14 pts) and C (28 pts)
 * threshold ticks. Shows a proximity note when meaningful: "Excellent"
 * (A, ≤5 pts), "2 pts from B" (11–13), "1 pt from C" (B at 24–27).
 * Lower is better.
 */
export interface ScoreBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Inspection score (violation points). Non-numeric renders nothing. */
  score: number | string;
  /** Letter grade — selects the fill color. Unknown = neutral grey. */
  grade?: string;
  /** Track right edge in points. Production uses 40. */
  max?: number;
}

export function ScoreBar(props: ScoreBarProps): JSX.Element | null;
