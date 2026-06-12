import * as React from "react";

/**
 * The brand logomark: the signature grade chip set as the mark, optionally
 * locked up with the "NYC Restaurant / Grade" wordmark. Use `showWordmark`
 * off for app icons / favicons. The chip defaults to the green "A".
 */
export interface LogomarkProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "horizontal" (chip + inline wordmark) or "stacked" (chip over wordmark). */
  layout?: "horizontal" | "stacked";
  /** Letter shown in the chip — almost always "A". B/C/other recolor it. */
  grade?: string;
  /** Chip edge length in px; wordmark scales from it. Default 40. */
  size?: number;
  /** Show the wordmark. Off = mark-only (app icon / favicon). Default true. */
  showWordmark?: boolean;
}

export function Logomark(props: LogomarkProps): JSX.Element;
