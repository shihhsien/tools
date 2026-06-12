import * as React from "react";

/**
 * The iconic NYC DOHMH window placard, matched to the production app
 * (v1.24): 200px white card, 4px radius, Arial Narrow, "SANITARY
 * INSPECTION / GRADE" header, 110px letter, compact "NYC DEPT OF HEALTH
 * & MENTAL HYGIENE" footer, soft shadow. Blue A / green B / orange C ink;
 * any other grade renders the near-black "GRADE PENDING" card. The app
 * shows it as a hero above a single search result.
 */
export interface GradePlacardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "A" | "B" | "C" (colored ink) — anything else renders GRADE PENDING. */
  grade?: "A" | "B" | "C" | "PENDING" | string;
  /** Card width in px (production is 200); everything scales from it. */
  size?: number;
}

export function GradePlacard(props: GradePlacardProps): JSX.Element;
