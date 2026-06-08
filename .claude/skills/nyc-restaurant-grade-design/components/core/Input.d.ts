import * as React from "react";

/**
 * A text field. The "default" variant is the standard dark form input;
 * the "accent" variant is the indigo-tinted field reserved for the
 * "paste a Google Maps link" affordance.
 *
 * @startingPoint section="Core" subtitle="Dark form text field" viewport="360x80"
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** "default" dark field, or "accent" indigo-tinted Maps-link field. */
  variant?: "default" | "accent";
}

export function Input(props: InputProps): JSX.Element;
