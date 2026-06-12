import * as React from "react";

/**
 * The trend line comparing the two most recent inspection scores (lower is
 * better): "▲ Improving (7 pts) since previous inspection" in B-green,
 * "▼ Declining" in C-orange, or "▬ No change" muted. Renders nothing if
 * either score is missing.
 */
export interface TrendProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Most recent inspection score. */
  current: number | string;
  /** Previous inspection score. */
  previous: number | string;
}

export function Trend(props: TrendProps): JSX.Element | null;
