import * as React from "react";

/**
 * The primary action button — full-width, inverted (white fill / black
 * label), with the app's signature opacity-dim press state. This is the
 * only button style the product uses.
 *
 * @startingPoint section="Core" subtitle="Primary inverted action button" viewport="360x80"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label. */
  children?: React.ReactNode;
  /** Dim to 45% and disable interaction. */
  disabled?: boolean;
}

export function Button(props: ButtonProps): JSX.Element;
