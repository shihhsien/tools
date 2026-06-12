import * as React from "react";

/**
 * A small tappable chip — production uses these for the "recently
 * searched" row under the Maps-link field. Card fill, hairline border,
 * 14px radius, 12px text.
 */
export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function Chip(props: ChipProps): JSX.Element;
