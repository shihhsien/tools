import * as React from "react";

/**
 * The signature color-coded inspection-grade chip.
 * A = green (pass), B = amber (caution), C = red (fail); anything else
 * (e.g. "N/A", "?") renders on the neutral pending grey at a smaller size.
 *
 * @startingPoint section="Brand" subtitle="The color-coded grade chip" viewport="200x120"
 */
export interface GradeBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Letter grade or short status string. Default "A". */
  grade?: string;
  /** Tinted/translucent treatment instead of solid fill. Default false. */
  soft?: boolean;
  /** Square edge length in px. Default 48. */
  size?: number;
}

export function GradeBadge(props: GradeBadgeProps): JSX.Element;
