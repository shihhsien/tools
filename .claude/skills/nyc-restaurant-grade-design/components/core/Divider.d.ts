import * as React from "react";

/**
 * A hairline rule. With a `label` it becomes the app's centered eyebrow
 * divider (uppercase, tracked) used for "OR PASTE A LINK"; without one it
 * is a plain 1px separator.
 */
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional centered uppercase label. */
  label?: string;
}

export function Divider(props: DividerProps): JSX.Element;
