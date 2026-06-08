import * as React from "react";

/**
 * The base surface: #161617 fill, 1px hairline border, 14px radius, 14px
 * padding, no shadow. The single surface recipe the whole product is built
 * from. Compose content inside; for inspection results use ResultCard.
 *
 * @startingPoint section="Core" subtitle="Base surface card" viewport="360x140"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Card(props: CardProps): JSX.Element;
