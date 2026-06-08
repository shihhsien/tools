import * as React from "react";

/**
 * The narration / status line beneath the search controls. Carries the
 * app's plain-language machine narration ("1 match · official data") in
 * the default tone, or recovery-path error copy in the error tone.
 */
export interface StatusLineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "default" muted narration, or "error" soft-red. */
  tone?: "default" | "error";
  children?: React.ReactNode;
}

export function StatusLine(props: StatusLineProps): JSX.Element;
