import * as React from "react";

/**
 * Action button, full-width. "primary" is the white inverted button (one
 * per screen); "secondary" is the dark card-surface button the app added
 * for the "📍 Graded restaurants near me" action — card fill, hairline
 * border, slightly smaller type. Both share the opacity-dim press state.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  /** "primary" white inverted (default), or "secondary" dark outlined. */
  variant?: "primary" | "secondary";
  /** Dim to 45% and disable interaction. */
  disabled?: boolean;
}

export function Button(props: ButtonProps): JSX.Element;
