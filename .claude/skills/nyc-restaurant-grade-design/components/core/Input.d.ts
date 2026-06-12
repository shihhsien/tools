import * as React from "react";

/**
 * A text field. The "default" variant is the standard dark form input;
 * the "accent" variant is the indigo-tinted field reserved for the
 * "paste a Google Maps link" affordance.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** "default" dark field, or "accent" indigo-tinted Maps-link field. */
  variant?: "default" | "accent";
}

export function Input(props: InputProps): JSX.Element;
