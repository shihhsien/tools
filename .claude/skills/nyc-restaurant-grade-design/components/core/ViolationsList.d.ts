import * as React from "react";

/**
 * Collapsible violations disclosure from the latest inspection. Closed
 * state is a "▸ 3 violations · 1 critical" summary line; open lists each
 * violation with a Critical (orange-tinted) / Not Critical (grey) flag
 * chip, mono violation code, plain-English category, and description.
 * Empty array renders "✓ No violations at last inspection".
 */
export interface Violation {
  /** Violation description text. */
  desc: string;
  /** "Critical" | "Not Critical" — anything else hides the flag chip. */
  flag?: string;
  /** DOHMH violation code, e.g. "10F". */
  code?: string;
  /** Plain-English category from the NYC health-code reference. */
  category?: string;
}

export interface ViolationsListProps extends React.HTMLAttributes<HTMLDivElement> {
  violations?: Violation[];
}

export function ViolationsList(props: ViolationsListProps): JSX.Element;
