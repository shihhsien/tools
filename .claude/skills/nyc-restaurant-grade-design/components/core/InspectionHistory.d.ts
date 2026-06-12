import * as React from "react";

/**
 * Collapsible inspection-history timeline: one row per inspection with
 * date, a 22px mini grade chip, points, and inspection type. Closed-by-
 * DOHMH rows show a red "Closed" label instead of a chip. Mini B/C chips
 * use the DENSE shades (--grade-b-dense / --grade-c-dense) — small white
 * text needs 4.5:1 contrast where the 48px chips only need 3:1. Renders
 * nothing with fewer than 2 entries.
 */
export interface HistoryEntry {
  /** Formatted date, e.g. "Mar 3, 2025". */
  date: string;
  /** Letter grade for that inspection ("A"/"B"/"C"); omit for ungraded. */
  grade?: string;
  /** Inspection score. */
  score?: number | string;
  /** Short inspection type, e.g. "Re-inspection". */
  type?: string;
  /** Row represents a Closed-by-DOHMH action. */
  closed?: boolean;
}

export interface InspectionHistoryProps extends React.HTMLAttributes<HTMLDivElement> {
  history?: HistoryEntry[];
}

export function InspectionHistory(props: InspectionHistoryProps): JSX.Element | null;
