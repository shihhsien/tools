import * as React from "react";

/**
 * A faithful recreation of the iconic NYC DOHMH window placard (Two Twelve,
 * 2010): white paper card, single-color ink, "SANITARY INSPECTION GRADE"
 * header, a giant letter, and the department footer. The authentic blue-A /
 * green-B / orange-C palette — and the black-and-white "GRADE PENDING" card.
 * Use it as the brand hero / empty-state motif, not as a dense list chip
 * (use GradeBadge for those).
 *
 * @startingPoint section="Brand" subtitle="The iconic NYC grade window placard" viewport="260x340"
 */
export interface GradePlacardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "A" | "B" | "C" (colored) or "PENDING" for the black-and-white card. */
  grade?: "A" | "B" | "C" | "PENDING" | string;
  /** Card width in px; height and type scale from it. Default 200. */
  size?: number;
}

export function GradePlacard(props: GradePlacardProps): JSX.Element;
