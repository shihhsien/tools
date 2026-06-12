import * as React from "react";

/**
 * The fully-composed inspection result card, matched to production v1.24
 * anatomy: optional closure banner → grade chip + name + address + meta
 * line (freshness · cuisine · phone · Map/Yelp/Resy links) → grade/score/
 * date line → optional plain-English grade context → score bar → trend →
 * last-inspection line → collapsible violations → collapsible history.
 * Composes ClosureBanner, GradeBadge, ScoreBar, Trend, ViolationsList,
 * InspectionHistory — don't rebuild those by hand.
 */
export interface ResultCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Letter grade ("A"/"B"/"C"). Ignored when pending. */
  grade?: string;
  /** Restaurant trading name (dba). */
  name?: string;
  /** Pre-formatted single-line address. */
  address?: string;
  /** Inspection score (points; lower is better). */
  score?: number | string;
  /** Formatted grade date, e.g. "Mar 3, 2025". */
  gradedDate?: string;
  /** Formatted last-inspection date. */
  inspectedDate?: string;
  /** Inspection type label. */
  inspectionType?: string;
  /** Render the "no letter grade on record yet" pending state. */
  pending?: boolean;
  /** Extra meta-line nodes (cuisine, phone link, "Map ↗" links…). */
  meta?: React.ReactNode[];
  /** Freshness text, e.g. "Inspected 3 months ago". */
  freshness?: string;
  /** Style the freshness text as overdue (orange, semibold). */
  overdue?: boolean;
  /** Show the plain-English grade meaning under the grade line. */
  showContext?: boolean;
  /** Latest-inspection violations; [] renders the ✓ no-violations line. */
  violations?: { desc: string; flag?: string; code?: string; category?: string }[];
  /** Inspection history rows (date/grade/score/type/closed). */
  history?: { date: string; grade?: string; score?: number | string; type?: string; closed?: boolean }[];
  /** Formatted date — renders the ⚠ Closed-by-DOHMH banner when set. */
  closedDate?: string;
}

export function ResultCard(props: ResultCardProps): JSX.Element;
