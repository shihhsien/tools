import * as React from "react";

/**
 * A fully-composed DOHMH inspection result: grade chip + restaurant name +
 * address, then the grade/score/date detail line, last-inspection line, and
 * an optional latest-violation note. Mirrors the app's result card exactly.
 *
 * @startingPoint section="Brand" subtitle="Composed inspection result card" viewport="380x200"
 */
export interface ResultCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Letter grade ("A"/"B"/"C"/…). Ignored when pending. */
  grade?: string;
  /** Restaurant trading name (dba). */
  name?: string;
  /** Pre-formatted single-line address. */
  address?: string;
  /** Inspection score (number). */
  score?: number | string;
  /** Formatted grade date, e.g. "Mar 3, 2025". */
  gradedDate?: string;
  /** Formatted last-inspection date. */
  inspectedDate?: string;
  /** Inspection type label. */
  inspectionType?: string;
  /** Latest cited violation description. */
  violation?: string;
  /** Critical flag text shown in parens before the violation. */
  criticalFlag?: string;
  /** Render the "no letter grade on record yet" pending state. */
  pending?: boolean;
}

export function ResultCard(props: ResultCardProps): JSX.Element;
